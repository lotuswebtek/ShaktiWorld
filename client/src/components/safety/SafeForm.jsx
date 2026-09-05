/**
 * Form wrapper for support-related pages.
 * Disables browser autofill and adds no-store meta via fetch headers.
 * Use this instead of <form> on Listening and Support Request pages.
 */
export default function SafeForm({ children, ...props }) {
  return (
    <form
      {...props}
      autoComplete="off"
      data-lpignore="true"
      data-form-type="other"
    >
      {children}
    </form>
  )
}
