'use client'

import { useQuery } from '@tanstack/react-query'
import cls from 'classnames'
import { format } from 'date-fns'
import captureElement from 'html2canvas'
import { pick, times } from 'lodash'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidV4 } from 'uuid'

import { CanopyType, DiskType, ItemGroup } from '@/constants'
import { type Grid } from '@/constants/canopies'
import { canopyLimiters } from '@/constants/limiter'
import { useLoader } from '@/hooks'
import { Core3D } from '@/libs/core'
import type { Dataset, State, TableData, UpdateClusterValues, UpdateDistanceValues } from '@/libs/core.type'
import { CanopyService, ProductService, ProjectService } from '@/services'
import '@/styles/pages/labs.scss'
import { Arrs } from '@/utils/array'
import { storage } from '@/utils/storage'

import { AsideMainComponent } from './components/aside-main'
import { AsideSubComponent } from './components/aside-sub'
import { GuideComponent } from './components/guide'
import { OverlapComponent } from './components/overlap'
import { RenderingComponent } from './components/rendering'
import { ButtonSave } from './components/save'
import { TransitionComponent } from './components/transition'

export default function LabsContainer() {
  // __STATE's
  const nodeRef = useRef<HTMLCanvasElement>(null)
  const coreRef = useRef<Core3D>()

  const loader = useLoader()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [state, setState] = useState<State>()

  const [selected, setSelected] = useState<Dataset>()

  const [activePanel, setActivePanel] = useState<number>(0)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isRendering, setIsRendering] = useState<boolean>(true)
  const [isOverlapped, setIsOverlapped] = useState<boolean>(false)

  const qs = useMemo(() => {
    const params = Object.fromEntries(searchParams)
    let save: State | null = null

    if (params?.save) {
      const decode = atob(params.save)
      save = JSON.parse(decode)
    }

    return {
      save,
      productId: Number(params.productId),
      canopyId: Number(params.canopyId),
      canopyColor: params?.canopyColor,
      canopyWireSet: JSON.parse(params?.canopyWireSet || '[]') as number[],
      canopyPresetId: Number(params?.canopyPresetId || 0),
      ceilingHeight: Number(params?.ceilingHeight || 300),
      bulbs: Number(params?.bulbs || 0),
      grid: JSON.parse(params?.grid || '[]') as Grid[]
    }
  }, [])

  // __FETCHER's
  const {
    data: res,
    isLoading,
    isRefetching,
    isFetched
  } = useQuery({
    queryKey: ['aria-labs', qs.productId, qs.canopyId],
    queryFn: async () => {
      const [product, canopy] = await Promise.all([
        ProductService.findOne(qs.productId),
        CanopyService.findOne(qs.canopyId)
      ])

      if (product && canopy) {
        canopy.limiter = canopyLimiters.filter(
          (r) =>
            (canopy.id === r.canopy?.id || canopy.name === r.canopy?.name) &&
            (product.id === r.product?.id || product.name === r.product?.name)
        )
      }

      return { product, canopy }
    },
    refetchOnWindowFocus: false
  })

  // __FUNCTION's
  const distanceCalc = useCallback((state: State) => {
    state.distanceFromFloor = state.ceiling - state.clusterHeight

    if (state.table) {
      state.distanceFromTable = state.ceiling - state.table.height - state.clusterHeight
    }

    return state
  }, [])

  const handleSave = useCallback(async () => {
    const core = coreRef.current
    if (core) {
      loader.on()
      setIsSaving(true)

      const state = core.getState()

      const canvas = document.createElement('canvas')
      canvas.className = 'canvas-treejs'
      canvas.width = 1240
      canvas.height = 1754
      document.body.appendChild(canvas)

      const x = new Core3D(canvas)
      await x.run(state, res?.canopy!, res?.product?.items!)
      x.createRulers()
      setTimeout(() => {
        x.resetPerspectiveCamera(3.14)
      }, 1e3)

      setTimeout(async () => {
        const name = `${res?.product?.name} ${format(new Date(), 'yyyy-MM-dd')}`
        const response = await ProjectService.create({
          type: DiskType.OBJECT3D,
          name,
          dataset: state
        })

        if (response?.data) {
          const captureCanvas = await captureElement(canvas, { backgroundColor: '#fafafa' })
          const image = captureCanvas.toDataURL('image/png', 1.0)
          storage.set('aria-image', image)

          router.push(`/order-summary?id=${response.data.id}`)
        }

        loader.off()
      }, 2e3)
    }
  }, [res])

  const handleUpdateDistance = useCallback(
    (payload: UpdateDistanceValues) => {
      const core = coreRef.current
      if (core && state) {
        if (JSON.stringify(pick(state, Object.keys(payload))) === JSON.stringify(payload)) {
          return void 0
        }

        loader.on()
        const diff = state.clusterHeight - payload.clusterHeight
        const newState = {
          ...state,
          ...payload,
          dataset: state.dataset.map((r) => ({
            ...r,
            wireLength: Math.max(10, r.wireLength - diff)
          })),
          timestamp: new Date().getTime()
        }

        setState(newState)
        core.setState(newState)
        core.updateDistance().finally(() => {
          loader.off()
          core.createRulers()
          core.useHitDetection(setIsOverlapped)
        })
      }
    },
    [state]
  )

  const handleUpdateTable = useCallback(
    (action: string, payload: TableData) => {
      const core = coreRef.current
      if (core && state) {
        if (action === 'create' && payload) {
          if (payload.type === 'rectangular-table') {
            payload.legs = [
              { x: -(payload.width / 2 / 10 - 1), z: -(payload.depth / 2 / 10 - 1) },
              { x: -(payload.width / 2 / 10 - 1), z: payload.depth / 2 / 10 - 1 },
              { x: payload.width / 2 / 10 - 1, z: -(payload.depth / 2 / 10 - 1) },
              { x: payload.width / 2 / 10 - 1, z: payload.depth / 2 / 10 - 1 }
            ]
          }

          core.createTable(payload)
        } else if (action === 'remove') {
          core.removeTable()
        }

        setTimeout(() => {
          const clusterHeight = core.getClusterHeight()
          const newState = {
            ...state,
            clusterHeight,
            table: payload,
            timestamp: new Date().getTime()
          }

          Object.assign(newState, distanceCalc(newState))

          setState(newState)
          core.setState(newState)
          core.createRulers()
        }, 10)
      }
    },
    [state]
  )

  const handleUpdateCanopy = useCallback(
    (color: string) => {
      const core = coreRef.current
      if (core && state) {
        loader.on()

        core.updateCanopy(color).finally(() => {
          const newState = {
            ...state,
            canopyColor: color,
            timestamp: new Date().getTime()
          }

          setState(newState)
          core.setState(newState)
          core.useHitDetection(setIsOverlapped)

          loader.off()
        })
      }
    },
    [state]
  )

  const handleUpdateCluster = useCallback(
    (uuid: string, payload: UpdateClusterValues) => {
      const core = coreRef.current
      if (core && state) {
        if (payload?.itemId) loader.on()

        core.updateCluster(uuid, payload).finally(() => {
          const clusterHeight = core.getClusterHeight()
          const coreState = core.getState()
          const newState = {
            ...state,
            clusterHeight,
            dataset: coreState.dataset.map((r) => (r.uuid === uuid ? { ...r, ...payload } : r)),
            timestamp: new Date().getTime()
          }

          Object.assign(newState, distanceCalc(newState))

          setState(newState)
          core.setState(newState)
          core.createRulers()

          if (payload?.itemId) {
            const a = newState.dataset.find((r) => r.uuid == uuid)!
            setSelected(a)
          }

          setTimeout(() => {
            core.useHitDetection(setIsOverlapped)
          }, 100)

          loader.off()
        })
      }
    },
    [state]
  )

  const handleUpdateClusters = useCallback(
    (payload: Dataset[], isMixing?: boolean) => {
      const core = coreRef.current
      if (core && state) {
        loader.on()

        core.updateClusters(payload).finally(() => {
          const clusterHeight = core.getClusterHeight()
          const { dataset } = core.getState()
          const newState = {
            ...state,
            isMixing,
            clusterHeight,
            dataset,
            timestamp: new Date().getTime()
          }

          Object.assign(newState, distanceCalc(newState))

          setState(newState)
          core.setState(newState)
          core.createRulers()

          setTimeout(() => {
            core.useHitDetection(setIsOverlapped)
          }, 100)

          loader.off()
        })
      }
    },
    [state]
  )

  // __EFFECT's
  useEffect(() => {
    if (isFetched && res?.product && res?.canopy) {
      if (qs?.save) setState(qs.save)
      else {
        const { product, canopy } = res

        const slug = ['cotdy', 'tee', 'pax'].some((r) => product.name.toLowerCase().includes(r))
        const vids = Arrs.shuffle(
          slug
            ? product.items!.filter(
                (r) =>
                  r.group === ItemGroup.MODEL && r.name?.toLowerCase().includes(product.name.toLowerCase())
              )
            : product.items!.filter((r) => r.group === ItemGroup.MODEL)
        )
          .slice(0, 3)
          .map((r) => r.vid)

        const items = product.items!.filter((r) => vids.includes(r.vid) && r.group === ItemGroup.COLOR)

        const defaultWireLength = 90
        let dataset: Dataset[] = []
        let canopyWireSet = qs.canopyWireSet

        if (qs.canopyPresetId) {
          canopyWireSet = canopy!.wireSet?.find((r) => r.id === qs.canopyPresetId)?.arr || []
        }

        if (qs.grid.length && canopy.type === CanopyType.SINGLE) {
          canopy.grid = qs.grid
        }

        if (canopy.grid?.length) {
          dataset = canopy.grid.map((r, i) => ({
            uuid: uuidV4(),
            posX: r.x,
            posZ: r.z,
            sorting: r?.sorting || i,
            wireLength: canopyWireSet?.length ? canopyWireSet[i] : defaultWireLength,
            modelSize: { x: 0, y: 0 },
            itemId: Arrs.random(items).id
          }))
        } else {
          if (canopy.name.toUpperCase().includes('SPBA-LINEAR')) {
            dataset = times(qs.bulbs).map((_, index) => ({
              uuid: uuidV4(),
              posX: 0,
              posZ: 0,
              sorting: index,
              wireLength: qs.canopyPresetId === 6 && index % 2 === 0 ? 45 : 80,
              modelSize: { x: 0, y: 0 },
              itemId: Arrs.random(items).id
            }))
          } else {
            dataset = [
              {
                uuid: uuidV4(),
                posX: 0,
                posZ: 0,
                sorting: 1,
                wireLength: defaultWireLength,
                modelSize: { x: 0, y: 0 },
                itemId: items[0].id
              }
            ]
          }
        }

        setState({
          uuid: uuidV4(),
          ceiling: qs.ceilingHeight,
          clusterHeight: 0,
          distanceFromTable: 0,
          distanceFromFloor: 0,
          productId: qs.productId,
          presetId: qs.canopyPresetId,
          canopyId: qs.canopyId,
          canopyColor: qs.canopyColor,
          dataset,
          bulbs: qs.bulbs,
          isMixing: !slug,
          timestamp: new Date().getTime(),
          table: {
            type: 'square-table',
            width: 120,
            height: 60,
            depth: 120,
            legs: [{ x: 0, z: 0 }],
            isActive: true
          }
        })
      }
    }
  }, [res, isFetched])

  useEffect(() => {
    if (!coreRef.current && nodeRef.current && state && res?.product && res?.canopy) {
      const instance = new Core3D(nodeRef.current)
      instance.run(state, res.canopy, res.product.items!).then((core) => {
        core.addClickListener((data) => {
          setSelected((prev) => {
            if (prev) {
              setActivePanel(-1)
              setTimeout(() => setActivePanel(2), 180)
            } else {
              setActivePanel(2)
            }

            return data
          })
        })

        setTimeout(() => {
          setIsRendering(false)
          setActivePanel(window.innerWidth < 640 ? -1 : 1)
          setState((prev) => {
            if (prev) {
              const { dataset } = core.getState()

              prev.dataset = dataset
              prev.clusterHeight = core.getClusterHeight()
              prev = distanceCalc(prev)

              core.setState(prev)
            }

            return prev
          })

          console.log(core)

          setTimeout(() => {
            core.createRulers()
            core.useHitDetection((bool) => setIsOverlapped(!!bool))
          }, 100)
        }, 100)
      })

      coreRef.current = instance
    }
  }, [state, res])

  useEffect(() => {
    if (isLoading || isRefetching) loader.on()
    if (isFetched) loader.off()

    return () => {
      const elm = document.querySelector('.canvas-treejs')
      if (elm) elm.remove()
    }
  }, [isLoading, isRefetching, isFetched])

  // __RENDER
  return (
    <div className='ui--labs-container'>
      <div className='relative size-full bg-zinc-100/75'>
        <canvas className='three-js size-full' ref={nodeRef} />
      </div>

      <GuideComponent />

      {isOverlapped && <OverlapComponent />}

      <RenderingComponent isRendering={isRendering} />

      {isSaving && (
        <div className='fixed inset-0 z-[980] flex items-center justify-center bg-white/50 backdrop-blur-lg'>
          <div className='animate-pulse text-lg italic text-zinc-800'>Saving...</div>
        </div>
      )}

      <div className={cls('ui--labs-action', { hidden: isRendering, active: activePanel < 1 })}>
        <button
          className='btn size-12 rounded-xl bg-white/80 ring-2 ring-white/90 drop-shadow-2xl backdrop-blur-lg'
          type='button'
          onClick={() => setActivePanel(1)}>
          <span className='bi bi-sliders2 text-2xl leading-none'></span>
        </button>
      </div>

      <div
        className={cls(
          'absolute bottom-12 left-1/2 -translate-x-1/2',
          { hidden: isRendering, active: activePanel < 1 },
          'sm:hidden'
        )}>
        <ButtonSave canSave={!isOverlapped} onSave={handleSave} />
      </div>

      <TransitionComponent visible={activePanel > 0} onClosed={() => setActivePanel(-1)}>
        <div className='ui--labs-panel-context rounded-2xl bg-white/75 ring-1 ring-white/80 drop-shadow-2xl'>
          {state && res?.product && res.canopy ? (
            activePanel === 1 ? (
              <AsideMainComponent
                key='aside-main'
                state={state}
                product={res.product}
                canopy={res.canopy}
                canSave={!isOverlapped}
                onSave={handleSave}
                onClose={() => setActivePanel(0)}
                onUpdateDistance={handleUpdateDistance}
                onUpdateTable={handleUpdateTable}
                onUpdateClusters={handleUpdateClusters}
                onUpdateCanopy={handleUpdateCanopy}
              />
            ) : activePanel === 2 && selected ? (
              <AsideSubComponent
                key='aside-sub'
                state={state}
                data={selected}
                items={res.product.items!}
                onApply={handleUpdateCluster}
                onClose={() => setActivePanel(1)}
              />
            ) : null
          ) : null}
        </div>
      </TransitionComponent>
    </div>
  )
}
