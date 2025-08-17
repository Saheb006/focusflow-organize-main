import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm onSwitchToSignUp={() => setIsLogin(false)} />
        ) : (
          <SignUpForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  )
}
