import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useContent } from '@/composables/useContent'
import { useToast } from '@/composables/useToast'
import { useBusinessStore } from '@/stores/business.store'
import type { IBusinessQuestions } from '@/types/content.types'

export function useWizard() {
  const router = useRouter()
  const route = useRoute()
  const { createContentProject, generateContent } = useContent()
  const { triggerToast } = useToast()
  const businessStore = useBusinessStore()

  // Estado local
  const currentStep = ref(1)
  const isSubmitting = ref(false)
  const businessId = ref(route.params.businessId as string)
  const prefilledFields = ref<string[]>([])

  // Watcher para actualizar businessId cuando cambie la ruta
  watch(
    () => route.params.businessId,
    (newBusinessId) => {
      if (newBusinessId && typeof newBusinessId === 'string') {
        businessId.value = newBusinessId
        console.log('BusinessId actualizado desde ruta:', newBusinessId)
      }
    },
    { immediate: true }
  )

  // Formulario de preguntas
  const questions = ref<IBusinessQuestions>({
    companyName: '',
    productsServices: '',
    targetAudience: '',
    mainProblem: '',
    solution: '',
    uniqueCharacteristics: '',
    authority: '',
    steps: ''
  })

  // Estados para el contenido generado
  const generatedContent = ref<{
    soundbites: any[]
    taglines: any[]
  } | null>(null)
  const isGenerating = ref(false)
  const generationStep = ref('')
  const showResults = ref(false)
  const currentContentId = ref<string | null>(null)
  const isEditMode = ref(false)

  // Configuración de pasos del wizard
  const wizardSteps = [
    {
      id: 1,
      title: 'Información Básica',
      description: 'Cuéntanos sobre tu empresa',
      fields: ['companyName', 'productsServices']
    },
    {
      id: 2,
      title: 'Audiencia Objetivo',
      description: 'Define a quién te diriges',
      fields: ['targetAudience']
    },
    {
      id: 3,
      title: 'Problema Principal',
      description: 'Identifica el problema que resuelves',
      fields: ['mainProblem']
    },
    {
      id: 4,
      title: 'Tu Solución',
      description: 'Explica cómo resuelves el problema',
      fields: ['solution']
    },
    {
      id: 5,
      title: 'Características Únicas',
      description: 'Qué te hace diferente',
      fields: ['uniqueCharacteristics']
    },
    {
      id: 6,
      title: 'Autoridad y Credibilidad',
      description: 'Por qué deberían confiar en ti',
      fields: ['authority']
    },
    {
      id: 7,
      title: 'Pasos del Proceso',
      description: 'Cómo trabajas con tus clientes',
      fields: ['steps']
    }
  ]

  // Computed
  const currentStepData = computed(() => {
    return wizardSteps.find(step => step.id === currentStep.value)
  })

  const isFirstStep = computed(() => currentStep.value === 1)
  const isLastStep = computed(() => currentStep.value === wizardSteps.length)
  const canProceed = computed(() => {
    if (!currentStepData.value) return false
    return currentStepData.value.fields.every(field => {
      const value = questions.value[field as keyof IBusinessQuestions]
      return value && value.trim().length > 0
    })
  })

  const progressPercentage = computed(() => {
    return (currentStep.value / wizardSteps.length) * 100
  })

  const prefilledFieldsCount = computed(() => prefilledFields.value.length)

  const prefilledFieldsMessage = computed(() => {
    const fieldNames: Record<string, string> = {
      companyName: 'Nombre de la empresa',
      productsServices: 'Productos/servicios',
      targetAudience: 'Audiencia objetivo',
      mainProblem: 'Problema principal',
      solution: 'Tu solución',
      uniqueCharacteristics: 'Características únicas',
      authority: 'Autoridad y credibilidad',
      steps: 'Pasos del proceso'
    }

    const prefilledNames = prefilledFields.value.map(field => fieldNames[field]).filter(Boolean)

    if (prefilledNames.length === 0) return ''
    if (prefilledNames.length === 1) return `Se prellenó: ${prefilledNames[0]}`
    if (prefilledNames.length === 2) return `Se prellenaron: ${prefilledNames.join(' y ')}`

    const lastField = prefilledNames.pop()
    return `Se prellenaron: ${prefilledNames.join(', ')} y ${lastField}`
  })

  // Métodos de navegación
  function nextStep() {
    if (canProceed.value && !isLastStep.value) {
      currentStep.value++
    }
  }

  function prevStep() {
    if (!isFirstStep.value) {
      currentStep.value--
    }
  }

  function goToStep(stepNumber: number) {
    if (stepNumber >= 1 && stepNumber <= wizardSteps.length) {
      currentStep.value = stepNumber
    }
  }

  // Función para prellenar datos del negocio
  function prefillBusinessData(business: any): number {
    prefilledFields.value = []

    // Información básica
    if (business.name) {
      questions.value.companyName = business.name
      prefilledFields.value.push('companyName')
    }

    if (business.description) {
      questions.value.productsServices = business.description
      prefilledFields.value.push('productsServices')
    }

    // Si hay información de industria, podemos sugerir audiencia objetivo
    if (business.industry) {
      const industryTargetAudiences: Record<string, string> = {
        'Technology': 'Empresas y profesionales que buscan soluciones tecnológicas innovadoras para optimizar sus procesos y aumentar su productividad.',
        'Healthcare': 'Pacientes y profesionales de la salud que necesitan servicios médicos de calidad y atención personalizada.',
        'Finance': 'Individuos y empresas que buscan servicios financieros confiables para gestionar y hacer crecer su patrimonio.',
        'Education': 'Estudiantes, padres de familia y instituciones educativas que buscan programas de formación de alta calidad.',
        'Retail': 'Consumidores que buscan productos de calidad a precios competitivos con una excelente experiencia de compra.',
        'Consulting': 'Empresas y emprendedores que necesitan asesoría especializada para resolver desafíos específicos y crecer.',
        'Real Estate': 'Compradores, vendedores e inversionistas que buscan oportunidades inmobiliarias con asesoría profesional.',
        'Food & Beverage': 'Consumidores que valoran la calidad, sabor y experiencia gastronómica única.',
        'Entertainment': 'Audiencias que buscan entretenimiento de calidad y experiencias memorables.',
        'Other': ''
      }

      if (industryTargetAudiences[business.industry]) {
        questions.value.targetAudience = industryTargetAudiences[business.industry]
        prefilledFields.value.push('targetAudience')
      }
    }

    // Si hay sitio web, podemos inferir que tienen presencia digital
    if (business.website && !questions.value.uniqueCharacteristics) {
      questions.value.uniqueCharacteristics = 'Contamos con una sólida presencia digital y años de experiencia en el mercado, lo que nos permite ofrecer soluciones confiables y accesibles.'
      prefilledFields.value.push('uniqueCharacteristics')
    }

    // Sugerencias basadas en el tipo de negocio
    const commonProblems: Record<string, string> = {
      'Technology': 'Procesos manuales ineficientes, falta de automatización y dificultades para escalar tecnológicamente.',
      'Healthcare': 'Dificultad para acceder a atención médica de calidad, largos tiempos de espera y falta de seguimiento personalizado.',
      'Finance': 'Falta de claridad en las finanzas personales, dificultad para ahorrar e invertir de manera efectiva.',
      'Education': 'Falta de programas educativos actualizados y personalizados que se adapten a las necesidades individuales.',
      'Retail': 'Dificultad para encontrar productos de calidad a precios justos con un servicio al cliente excepcional.',
      'Consulting': 'Falta de expertise interno para resolver problemas complejos y tomar decisiones estratégicas acertadas.',
      'Real Estate': 'Complejidad del mercado inmobiliario y falta de asesoría confiable para tomar decisiones de inversión.',
      'Food & Beverage': 'Dificultad para encontrar opciones gastronómicas que combinen calidad, sabor y buena relación calidad-precio.',
      'Entertainment': 'Falta de opciones de entretenimiento de calidad que ofrezcan experiencias verdaderamente memorables.',
      'Other': ''
    }

    if (business.industry && commonProblems[business.industry]) {
      questions.value.mainProblem = commonProblems[business.industry]
      prefilledFields.value.push('mainProblem')
    }

    // Sugerencias de soluciones basadas en la industria
    const commonSolutions: Record<string, string> = {
      'Technology': 'Ofrecemos soluciones tecnológicas personalizadas que automatizan procesos, mejoran la eficiencia y permiten el crecimiento escalable de tu negocio.',
      'Healthcare': 'Brindamos atención médica integral con tecnología avanzada, seguimiento personalizado y un equipo de profesionales comprometidos con tu bienestar.',
      'Finance': 'Proporcionamos asesoría financiera personalizada y herramientas que te ayudan a tomar decisiones inteligentes para hacer crecer tu patrimonio.',
      'Education': 'Ofrecemos programas educativos innovadores y personalizados que se adaptan a tu ritmo de aprendizaje y objetivos profesionales.',
      'Retail': 'Proporcionamos productos de alta calidad con una experiencia de compra excepcional y servicio al cliente personalizado.',
      'Consulting': 'Ofrecemos consultoría especializada con metodologías probadas que te ayudan a resolver desafíos complejos y alcanzar tus objetivos.',
      'Real Estate': 'Brindamos asesoría inmobiliaria integral con análisis de mercado detallado y acompañamiento en cada paso del proceso.',
      'Food & Beverage': 'Ofrecemos experiencias gastronómicas únicas con ingredientes de calidad y un servicio excepcional.',
      'Entertainment': 'Creamos experiencias de entretenimiento memorables que conectan emocionalmente con nuestras audiencias.',
      'Other': ''
    }

    if (business.industry && commonSolutions[business.industry]) {
      questions.value.solution = commonSolutions[business.industry]
      prefilledFields.value.push('solution')
    }

    // Sugerencias de autoridad basadas en la industria
    const authorityTemplates: Record<string, string> = {
      'Technology': 'Contamos con un equipo de expertos en tecnología con años de experiencia en el desarrollo de soluciones innovadoras para empresas de diversos sectores.',
      'Healthcare': 'Nuestro equipo está conformado por profesionales certificados con amplia experiencia clínica y compromiso con la excelencia médica.',
      'Finance': 'Somos asesores financieros certificados con track record comprobado en la gestión exitosa de patrimonios y planificación financiera.',
      'Education': 'Contamos con educadores certificados y metodologías pedagógicas innovadoras respaldadas por años de experiencia en formación.',
      'Retail': 'Tenemos años de experiencia en el sector retail con un profundo conocimiento del mercado y las necesidades del consumidor.',
      'Consulting': 'Somos consultores certificados con experiencia comprobada ayudando a empresas a resolver desafíos complejos y alcanzar sus objetivos.',
      'Real Estate': 'Contamos con agentes inmobiliarios certificados y un profundo conocimiento del mercado local e internacional.',
      'Food & Beverage': 'Tenemos chefs y especialistas gastronómicos con formación internacional y pasión por crear experiencias culinarias únicas.',
      'Entertainment': 'Contamos con un equipo creativo con amplia experiencia en la industria del entretenimiento y producción de eventos.',
      'Other': ''
    }

    if (business.industry && authorityTemplates[business.industry]) {
      questions.value.authority = authorityTemplates[business.industry]
      prefilledFields.value.push('authority')
    }

    // Sugerencias de pasos del proceso basadas en la industria
    const processSteps: Record<string, string> = {
      'Technology': '1. Consulta inicial para entender tus necesidades tecnológicas\n2. Análisis detallado de tus procesos actuales\n3. Diseño de la solución personalizada\n4. Implementación y configuración\n5. Capacitación del equipo\n6. Soporte continuo y optimización',
      'Healthcare': '1. Evaluación inicial y historial médico\n2. Diagnóstico profesional\n3. Plan de tratamiento personalizado\n4. Implementación del tratamiento\n5. Seguimiento y monitoreo\n6. Evaluación de resultados y ajustes',
      'Finance': '1. Consulta inicial para conocer tu situación financiera\n2. Análisis detallado de tus objetivos y riesgos\n3. Diseño de estrategia financiera personalizada\n4. Implementación del plan de inversión\n5. Monitoreo y seguimiento continuo\n6. Revisiones periódicas y ajustes',
      'Education': '1. Evaluación de nivel y objetivos de aprendizaje\n2. Diseño de plan de estudios personalizado\n3. Inicio del programa educativo\n4. Seguimiento del progreso\n5. Evaluaciones y retroalimentación\n6. Certificación y seguimiento post-graduación',
      'Retail': '1. Consulta sobre tus necesidades específicas\n2. Presentación de opciones personalizadas\n3. Proceso de compra simplificado\n4. Entrega o instalación profesional\n5. Seguimiento post-venta\n6. Soporte continuo y garantías',
      'Consulting': '1. Diagnóstico inicial de la situación\n2. Análisis profundo del problema\n3. Desarrollo de estrategia de solución\n4. Implementación del plan de acción\n5. Monitoreo y ajustes\n6. Evaluación de resultados y transferencia de conocimiento',
      'Real Estate': '1. Consulta inicial sobre tus objetivos inmobiliarios\n2. Análisis de mercado y opciones disponibles\n3. Visitas y evaluación de propiedades\n4. Negociación y gestión de documentos\n5. Cierre de la transacción\n6. Seguimiento post-venta y servicios adicionales',
      'Food & Beverage': '1. Consulta sobre preferencias y necesidades\n2. Recomendación de opciones personalizadas\n3. Preparación con ingredientes frescos\n4. Presentación y servicio\n5. Seguimiento de la experiencia\n6. Fidelización y ofertas especiales',
      'Entertainment': '1. Consulta sobre tipo de evento o experiencia\n2. Diseño conceptual y propuesta\n3. Planificación detallada y coordinación\n4. Ejecución del evento o experiencia\n5. Seguimiento durante el evento\n6. Evaluación post-evento y mejoras',
      'Other': ''
    }

    if (business.industry && processSteps[business.industry]) {
      questions.value.steps = processSteps[business.industry]
      prefilledFields.value.push('steps')
    }

    return prefilledFields.value.length
  }

  // Inicialización del wizard
  async function initializeWizard() {
    // Verificar que el businessId existe
    if (!businessId.value) {
      triggerToast('ID de negocio requerido', 'error')
      router.push('/dashboard')
      return
    }

    // Cargar información del negocio si está disponible
    if (businessStore.businesses.length === 0) {
      await businessStore.fetchBusinesses()
    }

    // Buscar el negocio por id o _id
    let business = businessStore.businesses.find(b => b.id === businessId.value)
    if (!business) {
      business = businessStore.businesses.find(b => b._id === businessId.value)
    }

    // Si no se encuentra el negocio específico pero hay negocios disponibles, usar el primero
    if (!business && businessStore.businesses.length > 0) {
      business = businessStore.businesses[0]
    }

    if (business) {
      // Forzar el prellenado del nombre de la empresa si existe
      if (business.name && !questions.value.companyName) {
        questions.value.companyName = business.name
      }
      
      prefillBusinessData(business)

      // Mostrar mensaje de éxito con detalles específicos
      if (prefilledFieldsCount.value > 0) {
        triggerToast(`${prefilledFieldsCount.value} campo${prefilledFieldsCount.value > 1 ? 's' : ''} prellenado${prefilledFieldsCount.value > 1 ? 's' : ''}. ${prefilledFieldsMessage.value}. Puedes editarlos si lo deseas.`, 'success')
      }
    }
  }

  // Envío del wizard
  async function submitWizard() {
    try {
      isSubmitting.value = true
      showResults.value = false
      generatedContent.value = null

      console.log('🚀 Iniciando creación de proyecto con datos:', {
        businessId: businessId.value,
        questions: questions.value
      })

      // Crear proyecto de contenido
      generationStep.value = 'Creando proyecto...'
      const content = await createContentProject(businessId.value, {
        questions: questions.value,
        tone: 'professional',
        aiProvider: 'gemini'
      })

      console.log('✅ Respuesta del createContentProject:', content)

      if (content && content._id) {
        currentContentId.value = content._id
        triggerToast('Proyecto creado exitosamente', 'success')

        // Generar automáticamente soundbites y taglines
        try {
          isGenerating.value = true
          generationStep.value = 'Generando soundbites y taglines con IA...'

          const result = await generateContent(content._id, false)

          if (result) {
            generatedContent.value = {
              soundbites: result.soundbites || [],
              taglines: result.taglines || []
            }
            showResults.value = true
            triggerToast('¡Soundbites y taglines generados exitosamente!', 'success')
            
            // Navegar a la vista de resultados
            setTimeout(() => {
              router.push(`/content/results/${content._id}`)
            }, 1500)
          }

        } catch (error) {
          console.error('Error al generar contenido:', error)
          triggerToast('Error al generar soundbites y taglines', 'error')
          // Navegar a resultados aunque falle la generación
          router.push(`/content/results/${content._id}`)
        } finally {
          isGenerating.value = false
        }
      } else {
        console.error('❌ No se recibió contenido válido:', content)
        triggerToast('Error: No se pudo crear el proyecto', 'error')
      }

    } catch (error: any) {
      console.error('❌ Error al crear proyecto:', error)
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      })

      // Mejorar el mensaje de error basado en el tipo de error
      let errorMessage = 'Error al crear el proyecto'
      if (error.status === 401) {
        errorMessage = 'No tienes autorización para realizar esta acción'
      } else if (error.status === 400) {
        errorMessage = error.message || 'Datos inválidos para crear el proyecto'
      } else if (error.status >= 500) {
        errorMessage = 'Error del servidor. Intenta nuevamente'
      } else if (error.message) {
        errorMessage = error.message
      }

      triggerToast(errorMessage, 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  function goToResults() {
    if (generatedContent.value) {
      // Navegar a la página de resultados
      router.push(`/content/results/${businessId.value}`)
    }
  }

  async function regenerateContent() {
    if (!currentContentId.value) {
      triggerToast('No hay contenido para regenerar', 'error')
      return
    }

    try {
      isGenerating.value = true
      generationStep.value = 'Regenerando contenido con IA...'

      const result = await generateContent(currentContentId.value, true)

      if (result) {
        generatedContent.value = {
          soundbites: result.soundbites || [],
          taglines: result.taglines || []
        }
        triggerToast('¡Contenido regenerado exitosamente!', 'success')
      }
    } catch (error) {
      console.error('Error al regenerar contenido:', error)
      triggerToast('Error al regenerar contenido', 'error')
    } finally {
      isGenerating.value = false
    }
  }

  function getButtonText() {
    if (isGenerating.value) {
      return generationStep.value || 'Generando contenido...'
    }
    if (isSubmitting.value) {
      return isEditMode.value ? 'Actualizando proyecto...' : 'Creando proyecto...'
    }
    return isEditMode.value ? 'Actualizar Soundbites y Taglines' : 'Crear Soundbites y Taglines'
  }

  function getGenerationMessage() {
    const messages = [
      '🎯 Analizando tu información empresarial...',
      '✨ Creando soundbites únicos para tu marca...',
      '🚀 Generando taglines personalizados...',
      '💡 Aplicando la metodología StoryBrand...',
      '🎨 Puliendo soundbites y taglines finales...'
    ]
    
    if (isGenerating.value) {
      return generationStep.value || messages[Math.floor(Math.random() * messages.length)]
    }
    
    return ''
  }

  /**
   * Prellenar datos desde contenido existente
   */
  function prefillContentData(content: any) {
    if (!content) {
      console.warn('⚠️ No se proporcionó contenido para prellenar')
      return
    }

    console.log('🔄 Iniciando prellenado desde contenido existente:', content)
    
    // Activar modo edición
    isEditMode.value = true
    
    // Prellenar businessId desde el contenido
    if (content.business?._id) {
      businessId.value = content.business._id
      console.log('✅ BusinessId prellenado:', businessId.value)
    }

    // Prellenar preguntas desde el contenido
    if (content.questions) {
      const contentQuestions = content.questions
      let fieldsPrefilledCount = 0
      const fieldsPrefilledList: string[] = []

      // Mapear cada campo de las preguntas
      if (contentQuestions.companyName) {
        questions.value.companyName = contentQuestions.companyName
        fieldsPrefilledCount++
        fieldsPrefilledList.push('companyName')
      }
      
      if (contentQuestions.productsServices) {
        questions.value.productsServices = contentQuestions.productsServices
        fieldsPrefilledCount++
        fieldsPrefilledList.push('productsServices')
      }
      
      if (contentQuestions.targetAudience) {
        questions.value.targetAudience = contentQuestions.targetAudience
        fieldsPrefilledCount++
        fieldsPrefilledList.push('targetAudience')
      }
      
      if (contentQuestions.mainProblem) {
        questions.value.mainProblem = contentQuestions.mainProblem
        fieldsPrefilledCount++
        fieldsPrefilledList.push('mainProblem')
      }
      
      if (contentQuestions.solution) {
        questions.value.solution = contentQuestions.solution
        fieldsPrefilledCount++
        fieldsPrefilledList.push('solution')
      }
      
      if (contentQuestions.uniqueCharacteristics) {
        questions.value.uniqueCharacteristics = contentQuestions.uniqueCharacteristics
        fieldsPrefilledCount++
        fieldsPrefilledList.push('uniqueCharacteristics')
      }
      
      if (contentQuestions.authority) {
        questions.value.authority = contentQuestions.authority
        fieldsPrefilledCount++
        fieldsPrefilledList.push('authority')
      }
      
      if (contentQuestions.steps) {
        questions.value.steps = contentQuestions.steps
        fieldsPrefilledCount++
        fieldsPrefilledList.push('steps')
      }

      // Actualizar campos prellenados
      prefilledFields.value = fieldsPrefilledList
      
      console.log(`✅ Prellenado completado: ${fieldsPrefilledCount} campos`, {
        campos: fieldsPrefilledList,
        questions: questions.value
      })
    }

    // Establecer el ID del contenido actual para modo edición
    if (content._id) {
      currentContentId.value = content._id
      console.log('✅ ContentId establecido para edición:', currentContentId.value)
    }
  }

  return {
    // Estado
    currentStep,
    isSubmitting,
    businessId,
    questions,
    generatedContent,
    isGenerating,
    generationStep,
    showResults,
    currentContentId,
    prefilledFields,
    wizardSteps,
    isEditMode,
    
    // Computed
    currentStepData,
    isFirstStep,
    isLastStep,
    canProceed,
    progressPercentage,
    prefilledFieldsCount,
    prefilledFieldsMessage,
    
    // Métodos
    nextStep,
    prevStep,
    goToStep,
    initializeWizard,
    submitWizard,
    goToResults,
    regenerateContent,
    getButtonText,
    getGenerationMessage,
    prefillBusinessData,
    prefillContentData
  }
}