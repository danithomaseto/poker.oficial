"use client";

import { useActionState } from "react";
import { criarContaDono, type CampoPrimeiroAcesso } from "@/app/(acesso)/acoes";
import { estadoInicial } from "@/lib/formularios";
import { Campo, CampoSenha } from "./campos";
import { AvisoFormulario, BotaoEnviar, useTremerAoErrar } from "./partes";

export function FormularioDono() {
  const [estado, acao] = useActionState(criarContaDono, estadoInicial<CampoPrimeiroAcesso>());
  const ref = useTremerAoErrar(estado);

  return (
    <div ref={ref}>
      <form action={acao} noValidate className="space-y-5">
        <Campo
          rotulo="Seu nome na mesa"
          name="nome"
          autoComplete="nickname"
          placeholder="Como a galera te chama"
          maxLength={20}
          required
          defaultValue={estado.valores?.nome}
          erros={estado.erros?.nome}
          dica="De 3 a 20 caracteres. Aparece na sua carteirinha."
        />
        <Campo
          rotulo="Email do dono"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="o email que você configurou no banco"
          required
          defaultValue={estado.valores?.email}
          erros={estado.erros?.email}
          dica="Precisa ser exatamente o email do passo de configuração do Supabase."
        />
        <CampoSenha rotulo="Crie uma senha" name="senha" autoComplete="new-password" required mostrarForca erros={estado.erros?.senha} />
        <CampoSenha rotulo="Repita a senha" name="confirmacaoSenha" autoComplete="new-password" required erros={estado.erros?.confirmacaoSenha} />
        <AvisoFormulario estado={estado} />
        <BotaoEnviar textoEnviando="Criando a conta do dono...">Criar conta de dono</BotaoEnviar>
      </form>
    </div>
  );
}
