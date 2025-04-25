function UserEquipment({ user, equipment }) {
  const userEquipment = equipment.filter(item => item.assignedTo === user.id);

  return (
    <div className="user-equipment">
      <h3>Ficha de {user.name}</h3>
      {user.imageUrl && (
        <img 
          src={user.imageUrl} 
          alt={user.name}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            objectFit: 'cover',
            marginBottom: '15px'
          }}
        />
      )}
      <p><strong>Departamento:</strong> {user.department}</p>
      
      <h4>Equipos asignados:</h4>
      {userEquipment.length > 0 ? (
        <ul>
          {userEquipment.map(item => (
            <li key={item.id}>
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.type} />
              )}
              <div>
                <strong>{item.type}</strong> - {item.model}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tiene equipos asignados</p>
      )}
    </div>
  );
}
export default UserEquipment;