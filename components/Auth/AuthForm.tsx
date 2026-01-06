"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { createAccount, login } from "@/app/actions";
import { useActionState } from "react";


export default function AuthTab() {
    const [state, action, isPending] = useActionState(createAccount, null);
    const [stateLogin, actionLogin, isPendingLogin] = useActionState(login, null);
    return (
        <main className="flex items-center justify-center fixed w-full h-screen z-9999 bg-black/70 inset-0">
            <Tabs defaultValue="account" className="w-100 bg-brand-mid p-5 rounded">
            <TabsList>
                <TabsTrigger value="account">Sign in</TabsTrigger>
                <TabsTrigger value="password">Login</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
                <form action={action} className="gap-2 flex flex-col">
                    <h2 className="text-center text-2xl">Sign in</h2>
                    <Input placeholder="Username" name="username"/>
                    <Input placeholder="Email" type="email" name="email"/>
                    <Input placeholder="Password" type="password" name="password"/>
                    <Input placeholder="Confirm password" type="password" name="rePassword"/>
                    {state?.message && (
                        <p className="text-red-500 text-sm">{state.message}</p>
                    )}
                    <Button>{isPending ? "Creating..." : "Sign in"}</Button>
                </form>
            </TabsContent>
            <TabsContent value="password">
                <form action={actionLogin} className="gap-2 flex flex-col">
                    <h2 className="text-center text-2xl">Login</h2>
                    <Input placeholder="Username" name="username"/>
                    <Input placeholder="Password" type="password" name="password"/>
                    {stateLogin?.message && (
                        <p className="text-red-500 text-sm">{stateLogin.message}</p>
                    )}
                    <Button>{isPending ? "Loging in..." : "Login"}</Button>
                </form>
            </TabsContent>
            </Tabs>
        </main>
    );
}