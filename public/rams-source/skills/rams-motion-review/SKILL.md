---
name: rams-motion-review
description: Decide si conviene añadir, conservar, reducir o quitar una transición en RAMS. Úsala para revisar la función del movimiento, la frecuencia de la tarea y la respuesta ante teclado, interrupción o movimiento reducido.
---

# Revisar el movimiento en RAMS

Leé el contrato de movimiento del proyecto y los roles RAMS que usa el componente. Identificá qué evento inicia el efecto, su frecuencia y qué le permite entender a la persona. Un cambio del estado funcional, del foco o de la información debe estar disponible sin depender del último cuadro.

- En la misma tarea y con los mismos datos, compará la transición con una señal inmediata. Elegí la señal inmediata si comunica lo necesario. Si la transición aclara el origen, la continuidad o el resultado, especificá el rol semántico y usá los tokens de Motion.
- Si se mueven varias partes, dibujá la secuencia por estados: qué elemento ancla la transición, cuáles pueden empezar en paralelo, qué parte espera una señal de otra y qué queda quieto. Vinculá las partes al evento que explica su aparición. Comprobá la secuencia con pocos y muchos elementos, al invertirla y con reducción. Usá los límites y roles de RAMS.
- Comprobá cuándo se puede volver a actuar, dónde queda el foco y cuándo aparece el estado final. En los casos aplicables, repetí la acción, invertí la transición y activá la preferencia de movimiento reducido al cargar y durante el efecto. Si se retira el movimiento, revisá qué dependía de sus callbacks y su desmontaje.
- Registrá la decisión y los casos observados con la evidencia que pide Motion. Para una decisión visual, usá la biblioteca de diseño del proyecto y verificá la interacción en la implementación consumida.
