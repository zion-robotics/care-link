export default function PatientDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0D1F35] mb-1">Your health overview</h1>
      <p className="text-sm text-[#6B8CAE] mb-8">Everything in one place</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Records", value: "0" },
          { label: "Prescriptions", value: "0" },
          { label: "Lab Results", value: "0" },
          { label: "Appointments", value: "0" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-[#E2ECF4] p-5 shadow-sm">
            <p className="text-2xl font-bold text-[#0D1F35]">{card.value}</p>
            <p className="text-sm text-[#6B8CAE] mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
