import type { ReactNode } from 'react';
import { useApi } from '../api/client.js';

type Props<R, I> = {
  title: string;
  description: string;
  path: string;
  select: (response: R) => I[];
  emptyText: string;
  errorLabel: string;
  renderItem: (item: I) => ReactNode;
};

export function CapabilityCard<R, I>({ title, description, path, select, emptyText, errorLabel, renderItem }: Props<R, I>) {
  const state = useApi<R>(path);
  let body: ReactNode;
  if (state.status === 'loading') {
    body = <p role="status">Loading {errorLabel}...</p>;
  } else if (state.status === 'error') {
    body = <p role="alert" className="text-danger">Unable to load {errorLabel}: {state.message}</p>;
  } else {
    const items = select(state.data) ?? [];
    body = items.length === 0
      ? <p>{emptyText}</p>
      : <ul className="list-group list-group-flush">{items.map((item, index) => <li key={index} className="list-group-item">{renderItem(item)}</li>)}</ul>;
  }
  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p>{body}</div></section>;
}
