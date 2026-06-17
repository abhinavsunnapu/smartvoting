import { Navigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'

const ProtectRoute = ({ children, allowedRoles = ['admin'] }) => {
    const { user, token } = useAuth()

    if (!user || !token) {
        return <Navigate to='/' replace />
    }

    const currentRole = user.activeSessionRole;

    // Check if the user's current role is authorized for this route
    if (!allowedRoles.includes(currentRole)) {
        // Redirect to their respective dashboard if they try to access an unauthorized page
        if (currentRole === 'voter') {
            return <Navigate to='/voter-dashboard' replace />
        } else {
            return <Navigate to='/dashboard' replace />
        }
    }

    return children
}

export default ProtectRoute
