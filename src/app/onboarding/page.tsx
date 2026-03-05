'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateOrgForm } from '@/components/onboarding/create-org-form'
import { JoinOrgForm } from '@/components/onboarding/join-org-form'

export default function OnboardingPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome to StackTrax Clinic</CardTitle>
        <CardDescription>Create a new clinic or join an existing one.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Clinic</TabsTrigger>
            <TabsTrigger value="join">Join Clinic</TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="mt-4">
            <CreateOrgForm />
          </TabsContent>
          <TabsContent value="join" className="mt-4">
            <JoinOrgForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
