export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-xl p-8 text-center">
      <h1 className="text-3xl font-bold mb-2">Доступ запрещён</h1>
      <p className="text-gray-600">
        У вас нет прав для просмотра этой страницы.
      </p>
    </div>
  );
}
