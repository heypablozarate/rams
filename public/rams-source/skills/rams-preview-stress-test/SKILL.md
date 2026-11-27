---
name: rams-preview-stress-test
description: Prueba un componente o preview de RAMS con estados límite alcanzables según su API, datos y callbacks. Úsala para revisar reflujo, nombres largos, vacíos, fallos, recuperación y operación con teclado.
---

# Probar estados límite en RAMS

Leé la documentación de la variante RAMS y localizá su consumidor real. Identificá cómo se monta y qué puede cambiar desde las props, los datos y las acciones. Si el proyecto tiene un preview, contrastá sus demostraciones y límites con el resultado que realmente produce.

- Armá unos pocos escenarios que puedan alterar el resultado. Asociá cada uno a una acción o entrada válida, su estado esperado y el riesgo que querés comprobar. Para reflujo, incluí el ancho donde el contenido empieza a competir por espacio y registrá cómo se amplió el texto.
- Reutilizá el preview o las pruebas existentes. Si necesitás aislar la causa, usá una prueba local temporal y volvé a la composición real. Seguí la acción desde la etiqueta y el foco hasta el cambio observable. Cuando corresponda, comprobá cómo se recupera el trabajo, se obtiene el valor completo o se alcanza el control por teclado.
- Cerrá con los escenarios comprobados, su resultado y los límites del entorno. Separá los casos sugeridos por el código de los resultados observados en ejecución.
