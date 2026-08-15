# Cambios de esta versión:
- Sueldos con distribución asimétrica (Sesgada a la derecha).
- Desconectar los gastos fijos del sueldo (Inyectar factor humano).
El código anterior asumía que el sueldo bajo se ahogaba con los gastos fijos y el sueldo alto se salvaba de ello. Se programaron excepciones: gente bajos ingresos que vive con sus padres, usuarios pudientes gastando mucho en hipotecas caras. Anomalías estadísticas incorporadas.
- Asignación probabilística del Perfil (Difuminar los límites).
Si el usuario supera el límite de endeudamiento, darle un 80% de chances de ser catalogado "En Riesgo", pero dejar un 20% de margen para que sea "En Observación" (tal vez su deuda es alta pero controlada). Si el usuario no tiene deudas, meterle un 5% de chances aleatorias de ser "En Riesgo" de todas formas (simulando un mal perfil crediticio externo). Supuestamente con esto se evita que el algoritmo haga ingeniería inversa perfecta de la fórmula. (prueba)
- Inyectar "pistas" en los hábitos de consumo. 
Los gastos se sorteaban basándose únicamente en el sueldo. Alterar el sorteo para que dependa también del comportamiento. Por ejemplo: forzar a que los usuarios destinados a ser "En Riesgo" tengan una probabilidad artificialmente alta de tener decenas de transacciones en "Ocio" y "Vestimenta", incluso si ganan bien. Gastos hormiga compulsivos. 
