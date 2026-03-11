
// ================= CONFIGURACIÓN =================
const API_KEY = "f44f23bd34b22f7b7d9016a81f522e83"; 
const API_BASE = "https://api.openweathermap.org/data/2.5";

// ================= FUNCIONES AUXILIARES =================
const obtenerClaseClimaCard = (descripcion) => {
  const e = descripcion.toLowerCase();
  if (e.includes('soleado') || e.includes('despejado')) return 'flip-card__back--soleado';
  if (e.includes('lluvia') || e.includes('tormenta')) return 'flip-card__back--lluvia';
  return 'flip-card__back--nublado';
};

const obtenerIconoClima = (descripcion) => {
  const e = descripcion.toLowerCase();
  if (e.includes('soleado') || e.includes('despejado')) return 'fa-sun';
  if (e.includes('lluvia') || e.includes('tormenta')) return 'fa-cloud-rain';
  if (e.includes('nublado') || e.includes('nubes')) return 'fa-cloud-sun';
  return 'fa-cloud-sun';
};

// ================= API CLIENT - OPENWEATHERMAP =================
class ApiClient {
  constructor(apiKey, baseURL = API_BASE) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  async obtenerClimaActual(ciudad) {
    const url = `${this.baseURL}/weather?q=${encodeURIComponent(ciudad)}&appid=${this.apiKey}&units=metric&lang=es`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error API: ${response.status}`);
    return await response.json();
  }

  async obtenerPronostico(ciudad) {
    const url = `${this.baseURL}/forecast?q=${encodeURIComponent(ciudad)}&appid=${this.apiKey}&units=metric&lang=es`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error API: ${response.status}`);
    return await response.json();
  }
}

// ================= WEATHER APP =================
class WeatherApp {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.lugaresBase = [
      { id: 1, nombre: 'Copenhague', img: './img/copenhague.jpg' },
      { id: 2, nombre: 'Berlín', img: './img/berlin.jpg' },
      { id: 3, nombre: 'Washington', img: './img/washington.jpg' },
      { id: 4, nombre: 'Londres', img: './img/londres.jpg' },
      { id: 5, nombre: 'Amsterdam', img: './img/amsterdam.jpg' },
      { id: 6, nombre: 'México', img: './img/mexico.jpg' },
      { id: 7, nombre: 'Roma', img: './img/roma.jpg' },
      { id: 8, nombre: 'Nueva York', img: './img/nueva-york.jpg' },
      { id: 9, nombre: 'Tokio', img: './img/tokio.jpg' },
      { id: 10, nombre: 'Sidney', img: './img/sidney.jpg' }
    ];
    this.lugares = [];
    this.itemsMostrados = 0;
    this.incremento = 5;
  }

  async inicializar() {
    try {
      const promesas = this.lugaresBase.map(async (lugarBase) => {
        const climaActual = await this.apiClient.obtenerClimaActual(lugarBase.nombre);
        const pronostico = await this.apiClient.obtenerPronostico(lugarBase.nombre);
        
        return {
          ...lugarBase,
          tempActual: Math.round(climaActual.main.temp),
          estadoActual: climaActual.weather[0].description,
          humedad: climaActual.main.humidity,
          viento: climaActual.wind.speed,
          pais: `${climaActual.name}, ${climaActual.sys.country}`,
          pronosticoSemanal: this.generarPronosticoSemanal(pronostico)
        };
      });

      this.lugares = await Promise.all(promesas);
    } catch (error) {
      console.error('Error inicializando:', error);
      
      this.lugares = this.lugaresBase.map((l, i) => ({
        ...l,
        tempActual: 10 + i,
        estadoActual: ['nublado', 'soleado', 'lluvia'][i % 3],
        humedad: 70 + i * 2,
        viento: 5 + i,
        pais: l.nombre,
        pronosticoSemanal: this.generarPronosticoSemanal()
      }));
    }
  }

  generarPronosticoSemanal(pronosticoData = null) {
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    if (pronosticoData?.list && pronosticoData.list.length > 0) {
      const pronosticosPorDia = {};
  
      pronosticoData.list.slice(0, 40).forEach(item => { 
        const fecha = item.dt_txt.split(' ')[0];
        if (!pronosticosPorDia[fecha]) pronosticosPorDia[fecha] = [];
        pronosticosPorDia[fecha].push(item);
      });
  
      const diasConDatos = Object.keys(pronosticosPorDia);
  
      return diasSemana.map((dia, i) => {
      
        if (i < 5 && diasConDatos[i]) {
          const itemsDia = pronosticosPorDia[diasConDatos[i]];
          const temps = itemsDia.map(item => item.main.temp).filter(t => t);
          
          return {
            dia,
            min: temps.length ? Math.round(Math.min(...temps)) : 10,
            max: temps.length ? Math.round(Math.max(...temps)) : 15,
            estado: itemsDia[0]?.weather[0]?.description || 'nublado'
          };
        } 
        
      
        return {
          dia,
          min: 8 + i,
          max: 14 + i,
          estado: i % 2 === 0 ? 'soleado' : 'nublado'
        };
      });
    }
  
    return diasSemana.map((dia, i) => ({
      dia,
      min: Math.max(0, 5 + i * 0.5),
      max: 12 + i,
      estado: i % 3 === 0 ? 'soleado' : i % 3 === 1 ? 'lluvia' : 'nublado'
    }));
  }
  
  async mostrarSiguientesLugares() {
    const contenedor = document.getElementById('lugares');
    const btnVerMas = document.getElementById('btn-ver-mas');
    if (!contenedor || this.itemsMostrados >= this.lugares.length) return;

    const siguienteGrupo = this.lugares.slice(this.itemsMostrados, this.itemsMostrados + this.incremento);

    for (const lugar of siguienteGrupo) {
      const claseClima = obtenerClaseClimaCard(lugar.estadoActual);
      const diasHTML = lugar.pronosticoSemanal.slice(0, 4).map(dia => `
        <div class="dia">
          <span>${dia.dia.slice(0, 3)}</span>
          <i class="fa-solid ${obtenerIconoClima(dia.estado)}"></i>
          <small>${dia.min}°/${dia.max}°</small>
        </div>
      `).join('');

      const cardHTML = `
        <div class="col-12 col-md-6 col-lg-4 lugares__item">
          <div class="flip-card" data-id="${lugar.id}">
            <div class="flip-card__inner">
              <div class="flip-card__front">
                <img src="${lugar.img}" class="flip-card__image" alt="${lugar.nombre}"
                     onload="this.classList.add('is-loaded')"
                     onerror="this.src='https://via.placeholder.com/300x250?text=${lugar.nombre}'">
                <span class="flip-card__city-name">${lugar.pais || lugar.nombre}</span>
              </div>
              <div class="flip-card__back ${claseClima}">
                <div>
                  <div class="flip-card__temp-actual">${lugar.tempActual}°C</div>
                  <div class="flip-card__estado">${lugar.estadoActual}</div>
                  <small>H:${lugar.humedad}% V:${lugar.viento}m/s</small>
                </div>
                <div class="flip-card__semana">${diasHTML}</div>
                <button class="btn-detalles">Ver detalles</button>
              </div>
            </div>
          </div>
        </div>
      `;
      contenedor.insertAdjacentHTML('beforeend', cardHTML);
    }

    this.itemsMostrados += this.incremento;
    if (btnVerMas && this.itemsMostrados >= this.lugares.length) {
      btnVerMas.style.display = 'none';
    }
  }

  async cargarLugares() {
    const contenedor = document.getElementById('lugares');
    contenedor.innerHTML = `
      <div class="text-center p-5">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3">Obteniendo datos climáticos...</p>
      </div>
    `;
    
    await this.inicializar();
    contenedor.innerHTML = '';
    this.mostrarSiguientesLugares();
  }

  cargarDetalleLugar(id) {
    const lugar = this.lugares.find(l => l.id === id);
    if (!lugar) return;

    const modal = document.getElementById('modalPronostico');
    const modalTitulo = document.getElementById('modalCiudad');
    const modalDias = document.getElementById('modalDias');
    const modalEstadisticas = document.getElementById('modalEstadisticas');

    modalTitulo.textContent = `${lugar.pais || lugar.nombre}`;
    
    modalDias.innerHTML = lugar.pronosticoSemanal.map(dia => `
      <div class="modal-clima__dia">
        <strong>${dia.dia}</strong><br>
        <i class="fa-solid ${obtenerIconoClima(dia.estado)}"></i><br>
        ${dia.min}° / ${dia.max}°
      </div>
    `).join('');

    const tempsMin = lugar.pronosticoSemanal
    .map(d => Number(d.min))
    .filter(t => !isNaN(t) && t !== undefined && t !== null);
    
  const tempsMax = lugar.pronosticoSemanal  
    .map(d => Number(d.max))
    .filter(t => !isNaN(t) && t !== undefined && t !== null);

  const minSemana = tempsMin.length ? Math.min(...tempsMin) : 10;
  const maxSemana = tempsMax.length ? Math.max(...tempsMax) : 18;
  
  
  const sumaMin = tempsMin.reduce((acc, temp) => acc + temp, 0);
  const sumaMax = tempsMax.reduce((acc, temp) => acc + temp, 0);
  const totalTemps = tempsMin.length + tempsMax.length;
  const promedio = totalTemps > 0 ? 
    Math.round((sumaMin + sumaMax) / totalTemps) : 14;

  const diasLluvia = lugar.pronosticoSemanal.filter(d => 
    d.estado?.toLowerCase().includes('lluvia')
  ).length;
  
  const diasSoleado = lugar.pronosticoSemanal.filter(d => 
    d.estado?.toLowerCase().includes('soleado') || 
    d.estado?.toLowerCase().includes('despejado')
  ).length;

  modalEstadisticas.innerHTML = `
    <div>⬇ Mín: ${minSemana}°C</div>
    <div>⬆ Máx: ${maxSemana}°C</div>
    <div>📊 Prom: ${promedio}°C</div>
    <div>☀️ Soleado: ${diasSoleado} días</div>
    <div>☔ Lluvia: ${diasLluvia} días</div>
    <div>🌤️ Nublado: ${7 - diasSoleado - diasLluvia} días</div>
    <div>💧 Humedad: ${lugar.humedad || 70}%</div>
    <div>💨 Viento: ${lugar.viento || 5} m/s</div>
  `;

    let alerta = '';
    if (promedio > 25) alerta = '⚠️ Alerta de calor extremo';
    if (diasLluvia > 4) alerta = '☔ Semana muy lluviosa';
    if (lugar.humedad > 85) alerta = '💧 Alta humedad';
    if (alerta) {
      modalEstadisticas.innerHTML += `<div class="alert alert-warning mt-2 p-2">${alerta}</div>`;
    }

    modal.classList.add('modal-clima--activo');
  }
}

// ================= INIT APP =================
document.addEventListener('DOMContentLoaded', () => {
  const btnTop = document.getElementById('btn-top');
  if (btnTop) {
    btnTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      btnTop.style.display = window.scrollY > 300 ? 'flex' : 'none';
    });
  }

  const contenedor = document.getElementById('lugares');
  if (contenedor) {
    const app = new WeatherApp(new ApiClient(API_KEY));
    app.cargarLugares();

    contenedor.addEventListener('click', (e) => {
      const card = e.target.closest('.flip-card');
      if (card) card.classList.toggle('flip-card--active');

      const btnDetalles = e.target.closest('.btn-detalles');
      if (btnDetalles) {
        const id = Number(btnDetalles.closest('.flip-card').dataset.id);
        app.cargarDetalleLugar(id);
      }
    });

    const btnVerMas = document.getElementById('btn-ver-mas');
    if (btnVerMas) {
      btnVerMas.addEventListener('click', () => app.mostrarSiguientesLugares());
    }

    const btnCerrarModal = document.getElementById('cerrarModal');
    if (btnCerrarModal) {
      btnCerrarModal.addEventListener('click', () => {
        document.getElementById('modalPronostico').classList.remove('modal-clima--activo');
      });
    }

    const modal = document.getElementById('modalPronostico');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('modal-clima--activo');
        }
      });
    }
  }
});
class ContactoApp {
  constructor() {
    this.form = null;
    this.btnEnviar = null;
    this.mensajeExito = null;
    this.mensajeError = null;
    this.btnTop = null;
    
    this.selectores = {
      form: '#form-contacto',
      btnEnviar: '#btnEnviar',
      mensajeExito: '#mensajeExito',
      mensajeError: '#mensajeError',
      btnTop: '#btn-top'
    };
  }


  async init() {
    try {
      await this.cargarElementosDOM();
      this.registrarEventos();
      console.log('✅ ContactoApp inicializada correctamente');
    } catch (error) {
      console.error('❌ Error inicializando ContactoApp:', error);
    }
  }


  async cargarElementosDOM() {
    return new Promise((resolve, reject) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => resolve());
      } else {
        resolve();
      }
    }).then(() => {
      this.form = document.querySelector(this.selectores.form);
      this.btnEnviar = document.querySelector(this.selectores.btnEnviar);
      this.mensajeExito = document.querySelector(this.selectores.mensajeExito);
      this.mensajeError = document.querySelector(this.selectores.mensajeError);
      this.btnTop = document.querySelector(this.selectores.btnTop);

     
      const elementosRequeridos = [this.form, this.btnEnviar, this.mensajeExito, this.mensajeError];
      if (elementosRequeridos.some(el => !el)) {
        throw new Error('Elementos DOM requeridos no encontrados');
      }
    });
  }

  registrarEventos() {
    this.form.addEventListener('input', (e) => this.validarCampoEnTiempoReal(e));
    this.form.addEventListener('submit', (e) => this.manejarEnvio(e));
    this.btnTop?.addEventListener('click', () => this.scrollToTop());
    window.addEventListener('scroll', () => this.manejarScrollTop());
  }


  validarCampoEnTiempoReal(event) {
    const { target: campo } = event;
    const esValido = campo.checkValidity();
    
    this.mostrarEstadoCampo(campo, esValido ? 'valido' : 'invalido');
  }

 
  async manejarEnvio(event) {
    event.preventDefault();
    
    try {
    
      if (!this.form.checkValidity()) {
        this.form.classList.add('was-validated');
        return;
      }

     
      await this.mostrarEstadoCargando(true);

   
      await this.simularEnvioAPI();

    
      await this.procesarEnvioExitoso();

    } catch (error) {
      console.error('Error en envío:', error);
      await this.procesarEnvioError();
    } finally {
      this.mostrarEstadoCargando(false);
    }
  }

  mostrarEstadoCargando(cargando) {
    return new Promise((resolve) => {
      if (cargando) {
        this.btnEnviar.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Enviando...';
        this.btnEnviar.disabled = true;
      } else {
        this.btnEnviar.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>Enviar Mensaje';
        this.btnEnviar.disabled = false;
      }
      setTimeout(resolve, 100);
    });
  }


  async simularEnvioAPI() {
    return new Promise((resolve) => {
 
      setTimeout(() => {
        const datosForm = new FormData(this.form);
        console.log('📤 Datos enviados:', Object.fromEntries(datosForm));
        resolve();
      }, 2000);
    });
  }

 
  async procesarEnvioExitoso() {
  
    this.form.reset();
    this.form.classList.remove('was-validated');
    
   
    document.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
      el.classList.remove('is-valid', 'is-invalid');
    });

  
    this.mensajeExito.classList.remove('d-none');
    this.mensajeError.classList.add('d-none');
    
 
    this.mensajeExito.scrollIntoView({ behavior: 'smooth' });
  }

 
  async procesarEnvioError() {
    this.mensajeError.classList.remove('d-none');
    this.mensajeExito.classList.add('d-none');
    this.mensajeError.scrollIntoView({ behavior: 'smooth' });
  }

 
  mostrarEstadoCampo(elemento, estado) {
    elemento.classList.toggle('is-valid', estado === 'valido');
    elemento.classList.toggle('is-invalid', estado === 'invalido');
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  manejarScrollTop() {
    if (this.btnTop) {
      this.btnTop.style.display = window.scrollY > 300 ? 'flex' : 'none';
    }
  }
}

// ================= INSTANCIACIÓN =================
document.addEventListener('DOMContentLoaded', async () => {
  const app = new ContactoApp();
  await app.init();
});