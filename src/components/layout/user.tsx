'use client'

import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'
import { useClickAway } from 'react-use'

import { useAuth, useTranslate } from '@/hooks'
import { modal } from '@/utils/addon'

import { SignInComponent } from '../modals/sign-in'
import { SignUpComponent } from '../modals/sign-up'
import { SVG } from '../svgs'
import { ButtonLang } from './lang'

export function UserComponent() {
  // __STATE<Next.14>
  const { t } = useTranslate()
  const user = useAuth()

  const nodeRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<boolean>(false)

  // __FUNCTION's
  const handleSignIn = useCallback(() => {
    const className = 'md-signin'
    modal.on(<SignInComponent />, { className, allowEscape: true })
  }, [])

  const handleSignUp = useCallback(() => {
    const className = 'md-signup'
    modal.on(<SignUpComponent />, { className, allowEscape: true })
  }, [])

  // __EFFECT's
  useClickAway(nodeRef, () => setActive(false), ['click'])

  // __RENDER
  return (
    <div className='ui--navigator-user relative' suppressHydrationWarning>
      {user.isAuth() ? (
        <div className='grid grid-flow-col gap-2'>
          <ButtonLang />

          <button
            className='btn gap-2 rounded-lg bg-black p-2 max-sm:gap-1'
            type='button'
            onClick={() => setActive(true)}>
            <img className='h-6 w-6 rounded-full' src={user.avatar} alt='User Avatar' />

            <span className='text-sm font-normal capitalize leading-4 text-white max-sm:text-xs'>
              {user.displayName}
            </span>

            <SVG width={24} height={24} viewBox='0 0 25 24'>
              <path
                d='M6.5 9L11.7929 14.6854C12.1834 15.1049 12.8166 15.1049 13.2071 14.6854L18.5 9'
                stroke='white'
                strokeWidth={2}
              />
            </SVG>
          </button>
        </div>
      ) : (
        <div className='grid grid-flow-col gap-2'>
          <button className='btn bg-transparent px-6 py-2 hover:underline' onClick={handleSignIn}>
            <span className='text text-base'>{t('btnSignIn')}</span>
          </button>

          <button
            className='btn bg-black px-6 py-2 text-white hover:underline max-sm:hidden'
            onClick={handleSignUp}>
            <span className='text text-base'>{t('btnSignUp')}</span>
          </button>

          <ButtonLang />
        </div>
      )}

      {active && (
        <div className='absolute right-0 mt-1 w-48' ref={nodeRef}>
          <ul className='grid rounded-lg bg-white p-2 shadow-md'>
            <li>
              <Link
                className='btn justify-start gap-2 rounded-lg p-2 hover:bg-slate-600/5'
                href='/account/settings'
                key='.setting'
                onClick={() => setActive(false)}>
                <SVG width={22} height={22} viewBox='0 0 25 24' fill='none'>
                  <path
                    d='M16.4454 6.83491L16.8204 7.48443V7.48443L16.4454 6.83491ZM19.1774 7.56696L19.8269 7.19196V7.19196L19.1774 7.56696ZM19.6774 8.43299L19.0279 8.80799L19.6774 8.43299ZM18.9454 11.165L19.3204 11.8146L18.9454 11.165ZM18.9454 12.8349L18.5704 13.4844L18.9454 12.8349ZM19.6774 15.567L20.327 15.942L19.6774 15.567ZM19.1774 16.433L18.5279 16.058L19.1774 16.433ZM16.4454 17.165L16.8204 16.5155L16.4454 17.165ZM8.55307 17.165L8.17807 16.5155H8.17807L8.55307 17.165ZM5.82102 16.433L6.47054 16.058H6.47054L5.82102 16.433ZM5.32102 15.567L4.6715 15.942H4.6715L5.32102 15.567ZM6.05307 12.8349L5.67807 12.1854H5.67807L6.05307 12.8349ZM6.05309 11.165L5.67809 11.8146H5.67809L6.05309 11.165ZM5.32104 8.43299L4.67152 8.05799H4.67152L5.32104 8.43299ZM5.82104 7.56696L6.47056 7.94196L5.82104 7.56696ZM8.55309 6.83491L8.17809 7.48443L8.55309 6.83491ZM11.9991 3.25C10.4804 3.25 9.24914 4.48122 9.24914 6H10.7491C10.7491 5.30964 11.3088 4.75 11.9991 4.75V3.25ZM12.9991 3.25H11.9991V4.75H12.9991V3.25ZM15.7491 6C15.7491 4.48122 14.5179 3.25 12.9991 3.25V4.75C13.6895 4.75 14.2491 5.30964 14.2491 6H15.7491ZM19.8269 7.19196C19.0676 5.87666 17.3857 5.426 16.0704 6.18539L16.8204 7.48443C17.4182 7.13925 18.1827 7.3441 18.5279 7.94196L19.8269 7.19196ZM20.3269 8.05799L19.8269 7.19196L18.5279 7.94196L19.0279 8.80799L20.3269 8.05799ZM19.3204 11.8146C20.6357 11.0552 21.0863 9.37329 20.3269 8.05799L19.0279 8.80799C19.3731 9.40585 19.1682 10.1703 18.5704 10.5155L19.3204 11.8146ZM20.327 15.942C21.0864 14.6267 20.6357 12.9448 19.3204 12.1854L18.5704 13.4844C19.1683 13.8296 19.3731 14.5941 19.0279 15.192L20.327 15.942ZM19.827 16.808L20.327 15.942L19.0279 15.192L18.5279 16.058L19.827 16.808ZM16.0704 17.8146C17.3857 18.5739 19.0676 18.1233 19.827 16.808L18.5279 16.058C18.1828 16.6559 17.4183 16.8607 16.8204 16.5155L16.0704 17.8146ZM12.9991 20.75C14.5179 20.75 15.7491 19.5188 15.7491 18H14.2491C14.2491 18.6904 13.6895 19.25 12.9991 19.25V20.75ZM11.9991 20.75H12.9991V19.25H11.9991V20.75ZM9.24914 18C9.24914 19.5188 10.4804 20.75 11.9991 20.75V19.25C11.3088 19.25 10.7491 18.6904 10.7491 18H9.24914ZM5.1715 16.808C5.93089 18.1233 7.61276 18.574 8.92807 17.8146L8.17807 16.5155C7.5802 16.8607 6.81571 16.6559 6.47054 16.058L5.1715 16.808ZM4.6715 15.942L5.1715 16.808L6.47054 16.058L5.97054 15.192L4.6715 15.942ZM5.67807 12.1854C4.36276 12.9448 3.91211 14.6267 4.6715 15.942L5.97054 15.192C5.62536 14.5941 5.8302 13.8296 6.42807 13.4844L5.67807 12.1854ZM4.67152 8.05799C3.91213 9.37329 4.36279 11.0552 5.67809 11.8146L6.42809 10.5155C5.83023 10.1703 5.62538 9.40585 5.97056 8.80799L4.67152 8.05799ZM5.17152 7.19196L4.67152 8.05799L5.97056 8.80799L6.47056 7.94196L5.17152 7.19196ZM8.92809 6.18539C7.61279 5.426 5.93091 5.87666 5.17152 7.19196L6.47056 7.94196C6.81574 7.3441 7.58023 7.13925 8.17809 7.48443L8.92809 6.18539ZM8.17809 7.48443C9.32082 8.14419 10.7491 7.31942 10.7491 6H9.24914C9.24914 6.16481 9.07074 6.26775 8.92809 6.18539L8.17809 7.48443ZM6.42807 13.4844C7.57077 12.8247 7.57085 11.1753 6.42809 10.5155L5.67809 11.8146C5.82079 11.8969 5.82083 12.103 5.67807 12.1854L6.42807 13.4844ZM10.7491 18C10.7491 16.6806 9.32085 15.8557 8.17807 16.5155L8.92807 17.8146C9.07069 17.7322 9.24914 17.8351 9.24914 18H10.7491ZM16.8204 16.5155C15.6777 15.8558 14.2491 16.6804 14.2491 18H15.7491C15.7491 17.8352 15.9276 17.7321 16.0704 17.8146L16.8204 16.5155ZM18.5704 10.5155C17.4276 11.1753 17.4277 12.8247 18.5704 13.4844L19.3204 12.1854C19.1776 12.103 19.1777 11.8969 19.3204 11.8146L18.5704 10.5155ZM14.2491 6C14.2491 7.31962 15.6777 8.14415 16.8204 7.48443L16.0704 6.18539C15.9275 6.26785 15.7491 6.16473 15.7491 6H14.2491ZM13.931 11.9999C13.931 12.7907 13.29 13.4318 12.4992 13.4318V14.9318C14.1184 14.9318 15.431 13.6191 15.431 11.9999H13.931ZM12.4992 13.4318C11.7084 13.4318 11.0674 12.7907 11.0674 11.9999H9.56738C9.56738 13.6191 10.88 14.9318 12.4992 14.9318V13.4318ZM11.0674 11.9999C11.0674 11.2092 11.7084 10.5681 12.4992 10.5681V9.06812C10.88 9.06812 9.56738 10.3807 9.56738 11.9999H11.0674ZM12.4992 10.5681C13.29 10.5681 13.931 11.2092 13.931 11.9999H15.431C15.431 10.3807 14.1184 9.06812 12.4992 9.06812V10.5681Z'
                    fill='#A0A3AC'
                  />
                </SVG>

                <span className='text-base'>{t('btnSetting')}</span>
              </Link>
            </li>

            <li>
              <Link
                className='btn justify-start gap-2 rounded-lg p-2 hover:bg-slate-600/5'
                href='/account/projects'
                key='.project'
                onClick={() => setActive(false)}>
                <SVG width={22} height={22} viewBox='0 0 25 24' fill='none'>
                  <path
                    d='M4.50001 6.5C4.50001 5.39543 5.39544 4.5 6.50001 4.5H9.05813C9.96948 4.5 10.8314 4.91427 11.4007 5.62591L11.8995 6.24939C12.2791 6.72382 12.8513 7 13.4588 7C14.4544 7 16.0642 7 17.5007 7C19.1576 7 20.5 8.34315 20.5 10V16.5C20.5 18.1569 19.1569 19.5 17.5 19.5H7.5C5.84314 19.5 4.5 18.1569 4.5 16.5L4.50001 6.5Z'
                    stroke='#A0A3AC'
                    strokeWidth={1.5}
                  />
                </SVG>

                <span className='text-base'>{t('btnMyProject')}</span>
              </Link>
            </li>

            <li>
              <Link
                className='btn justify-start gap-2 rounded-lg p-2 hover:bg-slate-600/5'
                href='/account/docs'
                key='.docs'
                onClick={() => setActive(false)}>
                <SVG width={22} height={22} viewBox='0 0 25 24' fill='none'>
                  <path
                    d='M20.5 14.6667V17C20.5 18.6569 19.1569 20 17.5 20H7.5C5.84315 20 4.50001 18.6569 4.50001 17L4.5 14.6667M8.05556 10.2222L12.5 14.6667M12.5 14.6667L16.9444 10.2222M12.5 14.6667V4'
                    stroke='#A0A3AC'
                    strokeWidth={1.5}
                  />
                </SVG>

                <span className='text-base'>{t('btnDownloadDocs')}</span>
              </Link>
            </li>

            <li className='mt-1 border-0 border-t border-solid border-slate-300 pt-1'>
              <button
                className='btn w-full justify-start gap-2 rounded-lg p-2 hover:bg-rose-600/10'
                type='button'
                onClick={() => {
                  user.signOut()
                  setActive(false)
                }}>
                <SVG width={22} height={22} viewBox='0 0 25 24' fill='none'>
                  <path
                    d='M9.83333 20H7.5C5.84315 20 4.5 18.6569 4.5 17V7C4.5 5.34315 5.84315 4 7.5 4H9.83333M16.0556 16.4444L20.5 12M20.5 12L16.0556 7.55556M20.5 12H10.8333'
                    stroke='#A0A3AC'
                    strokeWidth={1.5}
                  />
                </SVG>

                <span className='text-base'>{t('btnSignOut')}</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
