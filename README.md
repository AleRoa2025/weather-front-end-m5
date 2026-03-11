Portafolio Académico App Clima Internacional – MVP 
| Frontend Trainee – Talento Digital para Chile (SENCE)
Por: Alejandra Roa Peña
Versión: Marzo 2026

-Descripción

Esta cuarta entrega de portafolio, App Clima Internacional, es una aplicación web tipo Producto Mínimo Viable (MVP) que muestra 
información meteorológica en tiempo real de 10 capitales estratégicas del mundo.

Las ciudades fueron seleccionadas considerando dos criterios:

-Destinos académicos relevantes para estudiantes chilenos de postgrado.

-Países destacados en el Índice de Felicidad Mundial.

La aplicación consume datos reales mediante la API de OpenWeatherMap e implementa una arquitectura basada en Programación Orientada a Objetos (POO) usando JavaScript moderno (ES6+).

-Público Objetivo

El diseño prioriza la accesibilidad y simplicidad, especialmente para adultos mayores, es decir, usuarios que buscan información clara y rápida

Principios de diseño:
´
- Alta legibilidad (tipografía clara y buen contraste)

- Navegación simple e intuitiva

- Feedback visual según estado climático
  ´
  ´
 - Estructura de la Aplicación

-Home:	Flip-cards 3D con clima actual, humedad, viento y pronóstico de 7 días.
 Incluye paginación (5+5) y modales con estadísticas semanales.
-Acerca de: Contexto académico del proyecto y descripción del stack tecnológico.
-Contacto: 	Formulario interactivo con validación y respuestas dinámicas en JavaScript.
 ´
-Stack Tecnológico
´
Programación Orientada a Objetos (POO).
Clases: ApiClient (gestión de fetch) y WeatherApp (control de la lógica).
Inyección de Dependencias: Para un código más limpio y fácil de testear.
JavaScript ES6+	Async/await, arrow functions, sintaxis moderna
Consumo de API	OpenWeatherMap, 20 llamadas API paralelas optimizadas
Asincronía: Uso de async/await y Promise.all para gestionar 20 llamadas paralelas a la API sin bloquear la interfaz.
Manipulación DOM	Generación dinámica de componentes
UX/UI	Flip-cards, modales, responsive
BEM-CSS/SASS: El proyecto mantiene la metodología BEM (Block-Element-Modifier) para un CSS escalable y el Patrón 7-1 de Sass para una
organización profesional.
Los datos climáticos se cargan automáticamente desde OpenWeatherMap.
´
- Resumen de Tecnologías Utilizadas
HTML5
CSS3 / Sass (SCSS)
JavaScript (ES6+)
Bootstrap 5 (Layout y componentes base)
API OpenWeatherMap (Datos reales)
Font Awesome (Iconografía)

Objetivo Académico:
Incorporar lo aprendido en Modulo V, JavaScript Avanzado y Consumo de APIs, manteniendo el proyecto inicial y lo visto en entregas anteriores.
