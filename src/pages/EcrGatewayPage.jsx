import { useNavigate } from 'react-router-dom';

const securityTips = [
  'Install a licensed Anti-Virus / Anti-Malware on your systems (Computer / Laptop / Smartphone).',
  'Keep the system updated and patched.',
  'Maintain a complex password.',
  'Do not share passwords.',
];

const EcrGatewayPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900/80 px-4 py-12 text-sm text-slate-700">
      <div className="mx-auto w-full max-w-3xl rounded-lg bg-white shadow-xl">
        <header className="rounded-t-lg bg-rose-600 px-5 py-3">
          <h1 className="text-lg font-semibold text-white">Alert</h1>
        </header>
        <div className="space-y-6 px-5 py-6">
          <section className="space-y-2 text-slate-700">
            <p className="font-semibold text-rose-700">Dear Employers,</p>
            <p>
              Be vigilant against your credential theft/loss that may lead to cyber frauds. Please
              follow the security best practices mentioned below before proceeding.
            </p>
          </section>

          <section className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sky-700">
            <ul className="list-disc space-y-2 pl-5">
              {securityTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/login', { state: { modalFrom: '/gateway/ecr' } })}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcrGatewayPage;

