"use client";

import { useActionState } from "react";
import { entrar, type CampoLogin } from "@/app/(acesso)/acoes";
import { estadoInicial } from "@/lib/formularios";
import { Campo, CampoSenha } from "./campos";
import { AvisoFormulario, BotaoEnviar, useTremerAoErrar } from "./partes";

export function FormularioEntrar() {
  const [estado, acao] = useActionState(entrar, estadoInicial<CampoLogin>());
  const ref = useTremerAoErrar(estado);

  return (
    <div ref={ref}>
      <form action={acao} noValidate className="space-y-5">
        <Campo
          rotulo="Email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="voce@exemplo.com"
          required
          defaultValue={estado.valores?.email}
          erros={estado.erros?.email}
        />
        <CampoSenha
          rotulo="Senha"
          name="senha"
          autoComplete="current-password"
          required
          erros={estado.erros?.senha}
        />
        <AvisoFormulario estado={estado} />
        <BotaoEnviar textoEnviando="Entrando...">Entrar na mesa</BotaoEnviar>
      </form>
    </div>
  );
}
