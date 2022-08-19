import 'rease/jsx'
import { TypeReaseContext } from 'rease'

export default function Page404(
  this: TypeReaseContext
): void {
  console.log(this)
  ;(<h1>
    404: Page not found
  </h1>)
}
