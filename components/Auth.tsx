
import React, { useState } from 'react';
import { User, UserStatus, UserRole } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
  areas: string[];
}

export const Auth: React.FC<AuthProps> = ({ onLogin, areas }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    dob: '',
    area: areas[0] || 'Godhra Colony',
  });
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateAge = (dobString: string) => {
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Common Validation
    if (formData.mobile.length < 11) {
      setError("Please enter a valid mobile number");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
    }

    if (isRegistering) {
      // Registration Validation
      if (!validateEmail(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }
      if (!formData.firstName || !formData.lastName || !formData.dob) {
        setError("Please fill in all fields");
        return;
      }

      const ageNum = calculateAge(formData.dob);

      if (ageNum < 0) {
        setError("Invalid date of birth");
        return;
      }
      
      const newUser: User = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobile: formData.mobile,
        dob: formData.dob,
        age: ageNum,
        area: formData.area,
        isVoter: ageNum >= 18,
        status: UserStatus.PENDING, 
        role: UserRole.MEMBER
      };

      onLogin(newUser);
    } else {
      // Login Logic
      const isAdmin = isAdminLogin;
      
      // Simulate Database Retrieval
      const mockUser: User = {
        email: isAdmin ? "admin@pakgodhra.com" : "member@pakgodhra.com", 
        firstName: isAdmin ? "Admin" : "Ali",
        lastName: isAdmin ? "Secretary" : "Ahmed",
        mobile: formData.mobile,
        dob: "1988-01-01",
        age: 35,
        area: formData.area, 
        isVoter: true,
        status: UserStatus.APPROVED,
        role: isAdmin ? UserRole.ADMIN : UserRole.MEMBER
      };
      onLogin(mockUser);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
            G
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pak Godhra</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Community Portal</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h2 className="text-xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            {isRegistering ? 'New Member Registration' : (isAdminLogin ? 'Admin Portal Login' : 'Member Login')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Login Fields */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
              <input
                type="tel"
                required
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="0300 XXXXXXX"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
              />
            </div>

            {/* Registration Only Fields - Name Section */}
            {isRegistering && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                      <input
                      type="text"
                      required
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                      <input
                      type="text"
                      required
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                  </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input
                    type="email"
                    required
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                </div>
              </>
            )}

            {/* Password - Common */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
            </div>

            {/* Registration Only Fields - Bottom Section */}
            {isRegistering && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 dark:text-white transition-colors"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                  />
                </div>
                <div>
                   <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Area</label>
                   <select 
                     className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 dark:text-white transition-colors"
                     value={formData.area}
                     onChange={(e) => handleInputChange('area', e.target.value)}
                   >
                     {areas.map(area => (
                       <option key={area} value={area}>{area}</option>
                     ))}
                   </select>
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-xs text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`w-full font-bold py-3.5 rounded-xl shadow-md transition-colors ${isAdminLogin ? 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white' : 'bg-primary hover:bg-emerald-700 text-white'}`}
            >
              {isRegistering ? 'Submit Application' : (isAdminLogin ? 'Login to Dashboard' : 'Login')}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
             {!isAdminLogin && (
                <button
                onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError(null);
                    setFormData({ ...formData, password: '' });
                }}
                className="text-primary text-sm font-medium hover:underline block w-full"
                >
                {isRegistering ? 'Already a member? Login' : 'New Registration'}
                </button>
             )}

             {!isRegistering && (
                <button
                    onClick={() => {
                        setIsAdminLogin(!isAdminLogin);
                        setError(null);
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                    {isAdminLogin ? '← Back to Member Login' : 'Admin Login'}
                </button>
             )}
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
          By registering, you agree to the community guidelines. Voting rights are reserved for members 18+.
        </div>
      </div>
    </div>
  );
};
