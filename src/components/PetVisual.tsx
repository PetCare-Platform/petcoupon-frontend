import { Bird, Cat, Dog, PawPrint, Rabbit } from "@phosphor-icons/react";

export function PetVisual({ className = "" }: { className?: string }) {
  return (
    <div className={`relative isolate min-h-[380px] overflow-hidden rounded-[2.5rem] bg-sky/70 ${className}`} aria-label="강아지와 고양이, 토끼를 표현한 반려동물 일러스트" role="img">
      <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-lemon/80" />
      <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-accent/70" />
      <div className="absolute inset-x-8 bottom-8 top-10 rounded-[45%_55%_44%_56%/58%_42%_58%_42%] bg-white/85 shadow-[0_30px_80px_-45px_rgba(23,36,58,0.45)]" />
      <Dog weight="fill" className="absolute bottom-16 left-[14%] h-36 w-36 rotate-[-6deg] text-clay" aria-hidden="true" />
      <Cat weight="fill" className="absolute bottom-14 right-[12%] h-40 w-40 rotate-[5deg] text-ink" aria-hidden="true" />
      <Rabbit weight="fill" className="absolute right-[42%] top-10 h-20 w-20 text-accent-ink" aria-hidden="true" />
      <Bird weight="fill" className="absolute left-10 top-12 h-12 w-12 -rotate-12 text-[#4d8fc3]" aria-hidden="true" />
      <PawPrint weight="fill" className="absolute right-8 top-12 h-9 w-9 rotate-12 text-clay-ink/60" aria-hidden="true" />
    </div>
  );
}
