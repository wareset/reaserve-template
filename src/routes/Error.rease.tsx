import 'rease/jsx'
import { TypeReaseContext } from 'rease'
import { page } from 'reaserve'

export default function Error(
  this: TypeReaseContext
): void {
  console.log(this)
  console.log(page(this))
  
  ;(<h1>
    Error
  </h1>)
}
