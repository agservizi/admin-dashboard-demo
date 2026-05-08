import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { isDemoAuthenticated, setDemoAuthenticated } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(1, "La password è obbligatoria"),
  notes: z.string().optional(),
  role: z.enum(["viewer", "editor", "admin"]),
  remember: z.boolean(),
  marketing: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "demo@example.com",
      password: "demo",
      notes: "",
      role: "admin",
      remember: true,
      marketing: false,
    },
  });

  if (isDemoAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  function onSubmit(values: FormValues) {
    setDemoAuthenticated();
    toast.success("Accesso effettuato", {
      description: `Ruolo: ${values.role}. Benvenuto nella dashboard demo.`,
    });
    navigate("/", { replace: true });
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Tabs defaultValue="login" className="flex flex-col gap-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Accedi</TabsTrigger>
            <TabsTrigger value="info">Info demo</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Accesso amministratore</CardTitle>
                <CardDescription>
                  Login finto: qualsiasi email valida e password non vuota
                  abilitano la sessione (solo sessionStorage).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-4"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              autoComplete="username"
                              placeholder="demo@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              autoComplete="current-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ruolo (demo)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleziona ruolo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Solo per popolare la UI; non influisce sul backend.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note opzionali</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Annotazioni…"
                              className="min-h-[80px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col gap-3">
                      <FormField
                        control={form.control}
                        name="remember"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="flex flex-col gap-0.5">
                              <FormLabel>Ricorda sessione</FormLabel>
                              <FormDescription>
                                Persiste finché la scheda è aperta.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                aria-label="Ricorda sessione"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="marketing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start gap-3 rounded-lg border p-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                aria-label="Accetta comunicazioni marketing"
                              />
                            </FormControl>
                            <div className="flex flex-col gap-1 leading-none">
                              <FormLabel>Comunicazioni</FormLabel>
                              <FormDescription>
                                Checkbox demo senza effetti.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Entra
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="info">
            <Alert>
              <Info />
              <AlertTitle>Demo locale</AlertTitle>
              <AlertDescription>
                Avvia PostgreSQL, esegui le migrazioni e{" "}
                <code className="text-foreground text-xs">bun run seed</code>{" "}
                nel pacchetto API. Il frontend legge i KPI e la tabella risorse
                via fetch.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
