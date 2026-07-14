import * as XLSX from 'xlsx';

// Convierte un valor cualquiera (array, objeto, string, etc.) a texto legible para Excel
const toReadableText = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') {
    // Objetos tipo Firestore Timestamp
    if (typeof value.toDate === 'function') {
      try {
        return value.toDate().toLocaleString();
      } catch {
        return '';
      }
    }
    return JSON.stringify(value);
  }
  return value;
};

// Arma la fila de un usuario, resolviendo nombres de equipos en vez de solo IDs
const buildUserRow = (user, equipmentById) => {
  const equiposNombres = (user.equiposAsignados || [])
    .map((eqId) => equipmentById[eqId]?.nombre || eqId)
    .join(', ');

  return {
    ID: user.id,
    Nombre: user.name || '',
    Correo: user.correo || '',
    Departamento: user.department || '',
    Estado: user.estado || '',
    Ciudad: user.ciudad || '',
    'Tipo VPN': user.tipoVpn || '',
    'Equipos Asignados': equiposNombres,
    'Creado': toReadableText(user.createdAt),
  };
};

// Arma la fila de un equipo, resolviendo nombres de usuarios asignados en vez de solo IDs
const buildEquipmentRow = (equip, usersById) => {
  const usuariosNombres = (equip.usuariosAsignados || [])
    .map((userId) => usersById[userId]?.name || userId)
    .join(', ');

  return {
    ID: equip.id,
    Nombre: equip.nombre || '',
    Tipo: equip.type || '',
    Estado: equip.estado || '',
    Marca: equip.marca || '',
    Modelo: equip.model || '',
    'N° Serie': equip.serialNumber || '',
    Ciudad: equip.ciudad || '',
    Lugar: equip.lugar || '',
    Procesador: equip.procesador || '',
    RAM: equip.ram || '',
    'Disco Duro': equip.discoDuro || '',
    'Tarjeta Gráfica': equip.tarjetaGrafica || '',
    Windows: equip.windows || '',
    Office: equip.office || '',
    Antivirus: equip.antivirus || '',
    IPs: toReadableText(equip.IpEquipo),
    Descripción: equip.descripcion || '',
    'Usuarios Asignados': usuariosNombres,
  };
};

const buildDepartmentRow = (dept) => ({
  ID: dept.id,
  Nombre: dept.name || '',
  Creado: toReadableText(dept.createdAt),
});

// Ajusta automáticamente el ancho de columnas según el contenido más largo de cada una
const autosizeColumns = (rows) => {
  if (!rows.length) return [];
  const keys = Object.keys(rows[0]);
  return keys.map((key) => {
    const maxLen = rows.reduce(
      (max, row) => Math.max(max, String(row[key] ?? '').length),
      key.length
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 60) };
  });
};

/**
 * Exporta usuarios, equipos y departamentos a un único archivo Excel (.xlsx)
 * con una hoja por cada colección. Descarga el archivo directamente en el navegador.
 */
export function exportToExcel(users = [], equipment = [], departments = []) {
  const equipmentById = Object.fromEntries(equipment.map((e) => [e.id, e]));
  const usersById = Object.fromEntries(users.map((u) => [u.id, u]));

  const userRows = users.map((u) => buildUserRow(u, equipmentById));
  const equipmentRows = equipment.map((e) => buildEquipmentRow(e, usersById));
  const departmentRows = departments.map(buildDepartmentRow);

  const workbook = XLSX.utils.book_new();

  const userSheet = XLSX.utils.json_to_sheet(userRows);
  userSheet['!cols'] = autosizeColumns(userRows);
  XLSX.utils.book_append_sheet(workbook, userSheet, 'Usuarios');

  const equipmentSheet = XLSX.utils.json_to_sheet(equipmentRows);
  equipmentSheet['!cols'] = autosizeColumns(equipmentRows);
  XLSX.utils.book_append_sheet(workbook, equipmentSheet, 'Equipos');

  const departmentSheet = XLSX.utils.json_to_sheet(departmentRows);
  departmentSheet['!cols'] = autosizeColumns(departmentRows);
  XLSX.utils.book_append_sheet(workbook, departmentSheet, 'Departamentos');

  const fecha = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `gestion-usuarios-equipos_${fecha}.xlsx`);
}
