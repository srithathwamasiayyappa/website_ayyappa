import React from 'react';
import DeleteAccountPage from './DeleteAccountPage';

export default function AccountDeletionPage(props) {
  return (
    <section className="container section-block" style={{ padding: '20px 16px' }}>
      <DeleteAccountPage {...props} />
    </section>
  );
}
