"use client";

import { useActionState } from "react";
import { resgatarConvite, type CampoResgate } from "@/app/(acesso)/acoes";
import { estadoInicial } from "@/lib/formularios";
import { Campo, CampoCodigo, CampoSenha } from "./campos";
import { AvisoFormulario, BotaoEnviar, useTremerAoErrar } from "./partes";

export function FormularioConvite() {
  const [estado, acao] = useActionState(resgatarConvite, estadoInicial<CampoResgate>());
  const ref = useTremerAoErrar(estado);

  return (
    <div ref={ref}>
      <form action={acao} noValidate className="space-y-5">
        <CampoCodigo
          rotulo="Código do convite"
          name="codigo"
          placeholder="XXXX-XXXX-XXXX"
          required
          defaultValue={estado.valores?.codigo}
          erros={estado.erros?.codigo}
          dica="Quem te convidou passa o código. Ele vale uma vez só."
        />
        <Campo
          rotulo="Nome na mesa"
          name="nome"
          autoComplete="nickname"
          placeholder="Como a galera te chama"
          maxLength={20}
          required
          defaultValue={estado.valores?.nome}
          erros={estado.erros?.nome}
          dica="De 3 a 20 caracteres. É o que aparece na sua carteirinha e na mesa."
        />
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
          rotulo="Crie uma senha"
          name="senha"
          autoComplete="new-password"
          required
          mostrarForca
          erros={estado.erros?.senha}
        />
        <CampoSenha
          rotulo="Repita a senha"
          name="confirmacaoSenha"
          autoComplete="new-password"
          required
          erros={estado.erros?.confirmacaoSenha}
        />
        <AvisoFormulario estado={estado} />
        <BotaoEnviar textoEnviando="Conferindo convite...">Resgatar e criar conta</BotaoEnviar>
      </form>
    </div>
  );
}
