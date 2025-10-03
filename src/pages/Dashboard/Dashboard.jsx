import React from 'react';

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-md border">Stat 1</div>
        <div className="p-4 rounded-md border">Stat 2</div>
        <div className="p-4 rounded-md border">Stat 3</div>
      </div>
    </div>
  );
}


