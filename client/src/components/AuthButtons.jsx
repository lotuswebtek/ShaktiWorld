import { Show, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/react'
import { site } from '../data/site.js'

export default function AuthButtons({ onNavigate }) {
  const { user } = useUser()
  const firstName = user?.firstName || user?.username || 'there'

  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="redirect">
          <button className="btn btn-ghost" type="button" onClick={onNavigate}>
            Log in
          </button>
        </SignInButton>
        <SignUpButton mode="redirect">
          <button className="btn btn-solid" type="button" onClick={onNavigate}>
            Register
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <a
          className="btn btn-ghost"
          href={site.whatsappGroup}
          target="_blank"
          rel="noreferrer"
          onClick={onNavigate}
        >
          WhatsApp
        </a>
        <span className="user-chip">Namaste, {firstName}</span>
        <UserButton />
      </Show>
    </>
  )
}
