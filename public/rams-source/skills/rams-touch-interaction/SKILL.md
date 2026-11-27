---
name: rams-touch-interaction
description: Diseña o revisa gestos y comportamiento táctil en RAMS. Usala para arrastre, deslizamiento, cajones, desplazamiento anidado, teclado virtual y controles junto a los bordes de pantalla.
---

# Revisar interacción táctil en RAMS

Leé el contrato de movimiento y la documentación del componente RAMS. Verificá en la composición vigente qué control abre la interacción, qué región toma el gesto y qué resultado representa soltar, cancelar o cerrar.

- Separá contacto y liberación. Durante el contacto, medí si el cambio sigue al puntero dentro de sus límites. Derivá superficie y elementos dependientes del mismo progreso cuando deban mantenerse sincronizados. En la liberación, comprobá destino, cancelación y si un nuevo contacto retoma la posición actual. Cuando el patrón admite inercia, revisá cómo usa la dirección y velocidad del gesto. Los valores y la reducción se rigen por Motion.
- Probá el eje de desplazamiento nativo desde el contenido y desde la zona de arrastre. Incluí controles operables, un gesto en el eje perpendicular, cancelación y la operación equivalente por teclado cuando corresponda. Reservá la intervención sobre el desplazamiento para la región que compite con el gesto.
- En superficies fijas o pegadas a un borde, verificá acceso con el teclado virtual, al variar el área visible del navegador y con las áreas seguras que correspondan. Documentá si las observaciones vienen de dispositivo físico o emulación. En reducción, verificá el resultado inmediato y el acceso a la alternativa funcional. Cerrá indicando qué conservar o cambiar y qué gesto lo justifica. Si el arrastre y el scroll compiten, indicá la región concreta que debe ceder el gesto. Si la decisión depende del teclado virtual o del borde físico, identificá el caso de dispositivo pendiente.
