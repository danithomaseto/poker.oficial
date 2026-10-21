"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { Eye, EyeOff } from "lucide-react";
import { avaliarForcaSenha } from "@/lib/validacao/forca-senha";
import { formatarCodigoConvite } from "@/lib/validacao/formatar-codigo";

type PropsCampo = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  rotulo: string;
  name: string;
  erros?: string[] | undefined;
  dica?: ReactNode;
  icone?: ReactNode;
  /** Elemento à direita, dentro do campo (ex.: botão de mostrar senha). */
  acessorio?: ReactNode;
  classeInput?: string;
  ref?: Ref<HTMLInputElement>;
};

/** Campo de texto com rótulo, dica e mensagens de erro ligadas por aria-describedby. */
export function Campo({
  rotulo,
  name,
  erros,
  dica,
  icone,
  acessorio,
  classeInput,
  ...props
}: PropsCampo) {
  const id = useId();
  const temErro = Boolean(erros?.length);
  const idDica = dica ? `${id}-dica` : undefined;
  const idErro = temErro ? `${id}-erro` : undefined;

  return (
    <div className="group/campo">
      <label htmlFor={id} className="rotulo mb-2 block text-tinta-suave">
        {rotulo}
      </label>
      <div className="relative">
        {icone && (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-tinta/40 transition-colors group-focus-within/campo:text-tinta">
            {icone}
          </span>
        )}
        <input
          id={id}
          name={name}
          aria-invalid={temErro || undefined}
          aria-describedby={[idDica, idErro].filter(Boolean).join(" ") || undefined}
          className={`h-12 w-full rounded-[4px] border-2 bg-white/55 text-tinta transition-[border-color,background-color,box-shadow] duration-200 outline-none placeholder:text-tinta/35 focus:bg-white focus:shadow-[3px_3px_0_0_var(--color-tinta)] ${
            temErro
              ? "border-naipe-vermelho"
              : "border-tinta/25 hover:border-tinta/50 focus:border-tinta"
          } ${icone ? "pl-10" : "pl-3.5"} ${acessorio ? "pr-12" : "pr-3.5"} ${classeInput ?? ""}`}
          {...props}
        />
        {acessorio && (
          <span className="absolute top-1/2 right-2 -translate-y-1/2">{acessorio}</span>
        )}
      </div>
      {dica && (
        <div id={idDica} className="mt-1.5 text-xs text-tinta-suave">
          {dica}
        </div>
      )}
      {temErro && (
        <ul id={idErro} className="mt-1.5 space-y-0.5">
          {erros!.map((erro) => (
            <li key={erro} className="animar-mensagem text-sm font-medium text-naipe-vermelho">
              {erro}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type PropsSenha = Omit<PropsCampo, "type" | "acessorio"> & { mostrarForca?: boolean };

/** Campo de senha com botão de mostrar/ocultar e, opcionalmente, medidor de força. */
export function CampoSenha({ mostrarForca, onChange, ...props }: PropsSenha) {
  const [visivel, setVisivel] = useState(false);
  const [senha, setSenha] = useState("");
  const forca = avaliarForcaSenha(senha);
  const ref = useRef<HTMLInputElement>(null);

  // O React limpa o formulário depois do envio; o medidor acompanha.
  useEffect(() => {
    const formulario = ref.current?.form;
    if (!formulario) return;
    const aoLimpar = () => setSenha("");
    formulario.addEventListener("reset", aoLimpar);
    return () => formulario.removeEventListener("reset", aoLimpar);
  }, []);
  const cores = ["bg-tinta/10", "bg-naipe-vermelho", "bg-[#c0702a]", "bg-ouro-500", "bg-mesa-500"];

  return (
    <Campo
      {...props}
      ref={ref}
      type={visivel ? "text" : "password"}
      onChange={(e) => {
        setSenha(e.target.value);
        onChange?.(e);
      }}
      acessorio={
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
          className="grid size-9 place-items-center rounded-[4px] text-tinta/50 transition-colors hover:bg-tinta/8 hover:text-tinta"
        >
          {visivel ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      }
      dica={
        mostrarForca ? (
          <span className="flex items-center gap-3">
            <span aria-hidden className="flex flex-1 gap-1">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className="h-1.5 flex-1 overflow-hidden bg-tinta/10">
                  <span
                    className={`block h-full origin-left transition-transform duration-500 ease-(--ease-saida) ${cores[forca.nivel]}`}
                    style={{ transform: `scaleX(${forca.nivel >= n ? 1 : 0})` }}
                  />
                </span>
              ))}
            </span>
            <span className="min-w-20 text-right" aria-live="polite">
              {forca.rotulo || "Mínimo de 8 caracteres"}
            </span>
          </span>
        ) : (
          props.dica
        )
      }
    />
  );
}

/** Campo do código de convite: formata em grupos de 4 enquanto digita. */
export function CampoCodigo({ defaultValue, ...resto }: Omit<PropsCampo, "onChange" | "value">) {
  const [valor, setValor] = useState(() => formatarCodigoConvite(String(defaultValue ?? "")));

  return (
    <Campo
      {...resto}
      value={valor}
      onChange={(e) => setValor(formatarCodigoConvite(e.target.value))}
      autoCapitalize="characters"
      autoComplete="off"
      spellCheck={false}
      classeInput="font-mono text-lg tracking-[0.3em] uppercase"
    />
  );
}
