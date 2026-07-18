import type { RoleCode } from "@/models"

interface PlaceholderSection {
  title: string
  roles: RoleCode[]
  items: string[]
}

interface PlaceholderPageProps {
  title: string
  description: string
  sections: PlaceholderSection[]
}

export function PlaceholderPage({ title, description, sections }: PlaceholderPageProps) {
  return (
    <section className="grid gap-6">
      <header className="grid max-w-3xl gap-2.5">
        <p className="m-0 text-[13px] font-extrabold text-teal-700">页面占位</p>
        <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">{title}</h1>
        <p className="m-0 text-base leading-7 text-slate-600">{description}</p>
      </header>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {sections.map((section) => (
          <article className="min-h-[220px] rounded-lg border border-slate-200 bg-white p-[18px]" key={section.title}>
            <div className="mb-4 grid gap-3">
              <h2 className="m-0 text-lg font-extrabold text-slate-950">{section.title}</h2>
              <div className="flex flex-wrap gap-1.5">
                {section.roles.map((role) => (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600" key={role}>
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <ul className="m-0 grid gap-2.5 pl-[18px] leading-6 text-slate-600">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
