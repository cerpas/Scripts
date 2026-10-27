function enviarAvisosClasroomAutomatico() {
    // 1. Obtener todos tus cursos activos como profesor
    var cursos = Classroom.Courses.list({teacherId: 'me', courseStates: 'ACTIVE'}).courses;
    // Palabras que si aparecen en el título, la tarea SE IGNORA por completo
    var PALABRAS_A_EXCLUIR     = ["Examen", "evaluacion", "evaluación", "quiz", "prueba"]; 
    var NOMBRE_PROFESOR = "José Luis García Cerpas";
    // ==========================================
    
    if (!cursos || cursos.length === 0) {
      Logger.log("No se encontraron cursos activos.");
      return;
    }
    
    var ahora = new Date();
    
    // Recorrer cada curso
    cursos.forEach(function(curso) {
    Logger.log("Revisando curso: " + curso.name);
    
    // 2. Obtener las tareas (courseWork) de ese curso
    var tareas = Classroom.Courses.CourseWork.list(curso.id).courseWork;
    if (!tareas) return;
    
    tareas.forEach(function(tarea) {
      // FILTRO DE PARCIAL: Validar si el título de la tarea contiene la palabra clave
      var tituloTarea = tarea.title.toLowerCase();
    
        // FILTRO 1: EXCLUSIÓN DE EXÁMENES
      // Revisa si el título contiene alguna de tus palabras prohibidas
      var contienePalabraExcluida = PALABRAS_A_EXCLUIR.some(function(palabra) {
        return tituloTarea.indexOf(palabra) !== -1;
      });

      // Ignorar si la tarea no tiene fecha ni hora de entrega configurada
      if (!tarea.dueDate || !tarea.dueTime) return;
      
      // Construir la fecha exacta de vencimiento usando los datos de Classroom
      var fechaVencimiento = new Date(
        tarea.dueDate.year,
        tarea.dueDate.month - 1, // Los meses en JavaScript van de 0 a 11
        tarea.dueDate.day,
        tarea.dueTime.hours || 0,
        tarea.dueTime.minutes || 0
      );
      
      // Si la fecha de vencimiento aún no ha pasado, ignoramos la tarea por completo
      if (ahora < fechaVencimiento) return;
      
      // 3. Obtener el estado de entrega de todos los alumnos para esta tarea
      var entregas = Classroom.Courses.CourseWork.StudentSubmissions.list(curso.id, tarea.id).studentSubmissions;
      if (!entregas) return;
      
      entregas.forEach(function(entrega) {
        // LÓGICA DE EXCLUSIÓN TOTAL:
        // Los únicos estados que significan "El alumno NO ha entregado nada" son:
        // 'CREATED' (Tarea asignada, el alumno no ha hecho nada) 
        // 'NEW' (Tarea vacía en su panel)
        // Si el estado es 'TURNED_IN' (Entregada) o 'RETURNED' (Devuelta), el script saltará al siguiente alumno.
        if (entrega.state === "CREATED" || entrega.state === "NEW") {
          
          try {
            // 4. Obtener el perfil del alumno para tener su nombre y correo
            var perfilAlumno = Classroom.Courses.Students.get(curso.id, entrega.userId).profile;
            var nombreAlumno = perfilAlumno.name.givenName;
            var correoAlumno = perfilAlumno.emailAddress;
            
            // 5. Redactar y enviar el correo personalizado
            var asunto = "Tarea Vencida y Pendiente: " + tarea.title + " - " + curso.name;
            var mensaje = "Hola " + nombreAlumno + ",\n\n" +
                          "Te escribo porque revisando el sistema de Google Classroom detecté que la siguiente actividad se encuentra sin entregar:\n\n" +
                          "• Clase: " + curso.name + "\n" +
                          "• Tarea pendiente: " + tarea.title + "\n\n" +
                          "Como ya ha pasado la fecha límite, por favor ingresa a la plataforma lo antes posible, adjunta tus evidencias y asegúrate de hacer clic en el botón 'Entregar'.\n\n" +
                          "Si tienes alguna duda o contratiempo, puedes responder directamente a este correo.\n\n" +
                          "Saludos cordiales,\n" + NOMBRE_PROFESOR + "\nProfesor";
            
            MailApp.sendEmail(correoAlumno, asunto, mensaje);
            Logger.log("Recordatorio enviado a: " + correoAlumno + " por la tarea: " + tarea.title);
          } catch(e) {
            Logger.log("Error al procesar al alumno: " + e.message);
          }
        }
      });
    });
  });
}
