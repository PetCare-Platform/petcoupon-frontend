// 데스크톱 표와 모바일 카드가 동일한 items 배열 하나를 두 번(map) 렌더링하도록 묶어,
// 두 화면의 내용이 서로 다른 소스에서 나와 어긋나는 것을 막는다.
export default function RecordTable({
  caption,
  columns,
  items,
  renderRow,
  renderCard,
  tableId,
  cardsId,
  cardsAriaLabel,
  emptyState,
}) {
  if (items.length === 0) return emptyState ?? null;

  return (
    <>
      <div id={tableId} className="table-shell desktop-table">
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th scope="col" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{items.map(renderRow)}</tbody>
        </table>
      </div>
      <div id={cardsId} className="mobile-cards" aria-label={cardsAriaLabel}>
        {items.map(renderCard)}
      </div>
    </>
  );
}
