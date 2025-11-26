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
      route: '/personal_med/disponibilidad'
    },
    {
      id: 2,
      label: 'Citas',
      icon: 'calendar',
      route: '/personal_med/citas'
    },
    {
      id: 3,
      label: 'Chats',
      icon: 'comment',
      route: '/personal_med/chats'
    },
    {
      id: 4,
      label: 'Escanear QR',
      icon: 'qrcode',
      route: '/personal_med/scanner'
    }
  ]

  return userRole === 'admin' ? adminMenu : personalMenu
}