#We are gonna make the shop part



title is Tienda solidaria

we need the mocked data to make this able to have camisetas, gorras, juguetes, Libros, llaveros, mugs  
those are categories, 

so url must look something like

shop home

/tienda

category

/tienda/[category name]

article

\*should be a modal\* 



we need to have a shopping cart which will be persistent for the whole page, we are not using payment stuff yet, just mock it all

cart must have its own page too, with the recap of the selected items, and a button that says , comprar

after clicking that button page should change but just content, no other page, it should appear the recap, with a form that asks for name, last name, country, adress, city, phone, email, and aditional notes, finalizar compra button must dispatch an email service,  bu8t just keep it mocked and console logging it

the recap  section must have, product, subtotal, shipment with 2 options; Recogida local (no price); Domiciliio en Armenia Quindio (6k cop), and total

also must have, a message explaining this  
  
payment through bank transaction

a button that says, send voucher

once we confirm the payment, we start making the item