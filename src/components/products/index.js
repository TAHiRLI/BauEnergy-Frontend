import React from 'react'
import Product from '../product'


function Products() {

let products = [
    
    {id:1, name:"Product1" },
    {id:2, name:"Product2" },
    {id:3, name:"Product3" },
    {id:4, name:"Product4" }
    
]

  return (
    <div>
        <ul>
            

            {
                products.map((product, i)=> {
                    return (<li key={product.id}><Product data={product}/> </li>)
                })
            }
        </ul>
    </div>
  )
}

export default Products