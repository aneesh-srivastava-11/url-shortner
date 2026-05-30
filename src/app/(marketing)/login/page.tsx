import { MarketingLayout } from '@/components/layouts/marketing-layout'
import { LoginForm } from '@/components/forms/login-form'

export default function LoginPage() {
  return (
    <MarketingLayout>
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Choose your preferred sign in method
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </MarketingLayout>
  )
}
