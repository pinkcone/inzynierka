import React from 'react';
import Navbar from '../components/Navbar'; 
import useAuth from '../hooks/useAuth'; 

const UserProfile = () => {
  const { user } = useAuth(); 

  if (!user) {
    return <p>Ładowanie danych użytkownika...</p>; 
  }

  return (
    <div>
      <Navbar />
      <div style={{ marginTop: '200px' }}>
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h3>Profil użytkownika</h3>
                </div>
                <div className="card-body">
                  <div className="text-center mb-4">
                    <img 
                      src={user.image || '/images/profile_pictures/picture_1.png'} 
                      alt="User Avatar" 
                      className="img-fluid rounded-circle" 
                      width="150"
                    />
                  </div>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                      <strong>Email:</strong> {user.email}
                    </li>
                    <li className="list-group-item">
                      <strong>Nazwa użytkownika:</strong> {user.username}
                    </li>
                    <li className="list-group-item">
                      <strong>Rola:</strong> {user.role}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
