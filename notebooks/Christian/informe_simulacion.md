# 2)

`Revisar/discutir: si retomo los umbrales de deuda inicialmente acordados para **mapeo lógico** se provoca un desbalance desagradable que se puede ver en la fase EDA. Tal vez convenga mantener el 50, 35 multifactorial actual `

Se fijó una semilla global (np.random.seed = 42).

## Generación de usuarios
- 1.800 usuarios.
- Se utilizó una distribución uniforme continua (np.random.uniform) para asignar salarios lógicos que oscilan entre $1500 y $5000 mensuales redondeados a dos decimales.

## Transacciones
Se crearon 240000 transacciones, modeladas bajo la siguiente lógica:

Para hacer la muestra estadísticamente creíble las 10 categorías no se distribuyeron equitativamente. Se implementó una ruleta de probabilidades ponderadas (p=prob_categorias) donde gastos cotidianos (alimentación al 15%, servicios al 20%) aparecen con muchísima mayor frecuencia que compras grandes de lenta rotación (ej. Electrodomésticos al 5%).

### Poder adquisitivo (gastos elásticos vs inelásticos)
Para modelar el estilo de vida del usuario:
- Se lee el salario del usuario sobre el umbral mínimo (1500) para saber su capacidad (ej. gana 3 veces más que la media).
- **Gastos Elásticos:** En categorías vinculadas al "estatus" (vivienda, ocio, educación), el límite máximo de pago aleatorio escala proporcionalmente al sueldo del usuario. Quienes ganan más, pueden o suelen tender a pagar un alquiler más caro.
- **Gastos Inelásticos (productos/servicios de primera necesidad):** En categorías base (transporte, alimentación), el monto crece solo de manera marginal sin importar el salario.

## Perfil Financiero (target) - probando

Se entrena el modelo intentando predecir el perfil financiero basándose en **conductas**:
1.  **Nivel de Endeudamiento:** Sumando el *ticket promedio* de vivienda y servicios, dividido por los ingresos totales.  El resultado se restringe a un piso del 5% y un tope de 90% para asegurar que los cálculos jamás arrojen porcentajes irreales o errores en los datos.
2.  **Frecuencia de Ahorro:** Se clasifica en 'Alta', 'Media', 'Baja' o 'Ninguna' midiendo la cantidad promedio de veces por mes que el usuario realiza operaciones en la categoría 'Inversion'. 
3.  **Mapeo Lógico:** Las cuentas que cruzan el 50% de endeudamiento van directo a `"En riesgo"`. Las que mantienen finanzas holgadas (<35%) e invierten se tildan `"Saludable"`. El resto recae en `"En observacion"`. 
`cambiar a <=20, <40, >=40`

## Inyección de ruido
Para evitar que el modelo de Machine Learning memorice la data y para prepararlo frente a usuarios descuidados, se programaron "inyecciones" de ruido estadístico de forma consciente:


> **Puntos ciegos simulados intencionalmente:**
> *   **Ruido en PNL (20%):** A 1 de cada 5 transacciones se le inyectaron prefijos aleatorios inservibles (ej. "tarjeta ", "fac "). Además, a un 10% se le indujeron **faltas de ortografía simuladas** (reemplazo de "a" por "q").
> *   **Ruido Categórico (10%):** Se asignó una categoría errónea al azar al 10% de los gastos para prevenir un techo del 100% de precisión matemática en la evaluación.
> *   **Ruido en la Variable Objetivo (15%):** El 15% de los clientes recibió un perfil financiero opuesto a lo que dictaba su lógica financiera, obligando al Árbol de Decisión a ignorar excepciones extrañas.

## Prevención de leakage en splits
El guardado y corte del dataset aplicó mejores prácticas de MLOps:
*   **Usuarios:** Split Transversal puro 60/20/20.
*   **Transacciones:** Se usaron los primeros 8 meses del año para enseñar al modelo, y los últimos 4 meses para ponerlo a prueba. Esto garantiza que la Inteligencia Artificial no haga trampa aprendiendo de gastos que aún no han ocurrido en el tiempo.
