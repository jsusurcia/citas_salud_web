export function useMenuItems(userRole) {
  const adminMenu = [
    { 
      id: 1, 
      label: 'Validación', 
      icon: 'vial-circle-check',
      route: '/admin/validacion'
    },
    { 
      id: 2, 
      label: 'Especialidades', 
      icon: 'user-doctor', 
      route: '/admin/especialidades' 
    },
    { 
      id: 3, 
      label: 'Reportes', 
      icon: 'chart-simple', 
      route: '/admin/reportes' 
    }
  ]
  
  // Menú para PERSONAL MÉDICO
  const personalMenu = [
    { 
      id: 1, 
      label: 'Horarios', 
      icon: 'clock', 
      route: '/personal_medico/disponibilidad' 
    },
    { 
      id: 2, 
      label: 'Citas', 
      icon: 'calendar', 
      route: '/personal_medico/gestion_citas' 
    },
    { 
      id: 3, 
      label: 'Chats', 
      icon: 'comment', 
      route: '/personal_medico/chats' 
    }
  ]
  
  return userRole === 'admin' ? adminMenu : personalMenu
}