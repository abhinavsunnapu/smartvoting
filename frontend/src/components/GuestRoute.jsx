import { Navigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'

const GuestRoute = ({ children }) => {
    const { token } = useAuth()
    
    // If the user is authenticated (has token), redirect them to dashboard
    if (token) {
        return <Navigate to='/dashboard' replace></Navigate>
    }
    
    // Otherwise, let them access the login/signup pages
    return children
}

export default GuestRoute
