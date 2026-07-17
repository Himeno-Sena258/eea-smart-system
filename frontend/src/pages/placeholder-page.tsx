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
    <section className="page-shell">
      <header className="page-header">
        <p className="eyebrow">页面占位</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <div className="module-grid">
        {sections.map((section) => (
          <article className="module-card" key={section.title}>
            <div className="module-card-header">
              <h2>{section.title}</h2>
              <div className="role-tags">
                {section.roles.map((role) => (
                  <span key={role}>{role}</span>
                ))}
              </div>
            </div>
            <ul>
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
