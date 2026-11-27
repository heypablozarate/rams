---
name: rams-motion-performance
description: Diagnostica tirones, pérdida de cuadros o respuesta tardía durante animaciones y gestos de RAMS mediante una traza del consumidor real.
---

# Diagnosticar rendimiento de movimiento en RAMS

Leé el contrato de movimiento y los tokens RAMS que usa la aplicación. Identificá el consumidor que muestra el síntoma, el disparador, el motor y las propiedades efectivamente animadas. Para una revisión transversal, agrupá consumidores por causa y marcá qué se comprobó en navegador.

- Reproducí con el volumen de datos, la composición y la entrada que provocan el síntoma. Elegí un control que aísle la hipótesis, como ejecutar el mismo gesto a ambos lados del ancho de reflujo. Capturá la traza desde la entrada y distinguí actualización funcional, cadencia de cuadros y asentamiento visual. Registrá por separado el tiempo de desmontaje si sólo mediste ese hito.
- Vinculá el tramo lento con la evidencia de la traza. Separá tiempo de JavaScript, recálculo de estilo, layout, pintura y composición. Buscá, según el tramo, renderizados por evento, medidas que fuerzan layout, áreas grandes de pintura o capas innecesarias. Un estilo que parece caro en el código es una hipótesis hasta medirlo.
- Si el pedido incluye corregirlo, repetí el mismo escenario y condiciones tras el cambio. Verificá lectura, geometría, foco, interrupción y movimiento reducido según Motion. Cerrá decidiendo si conservar la implementación, intervenir la fase y el consumidor que identifica la traza o hacer una comparación adicional concreta. Una demora de asentamiento requiere evidencia de cuadros tardíos antes de atribuirle tirones.
