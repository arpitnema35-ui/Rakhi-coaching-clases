import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserMinus, 
  Search, 
  CheckCheck, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  AlertCircle 
} from 'lucide-react';
import { LiveParticipant } from '../../types';

interface AdminLobbyManagerProps {
  participants: LiveParticipant[];
  onAllowStudent: (participantId: string) => Promise<void> | void;
  onDisallowStudent: (participantId: string) => Promise<void> | void;
  onKickoutStudent: (participantId: string) => Promise<void> | void;
  onAllowAllWaiting: () => Promise<void> | void;
}

export default function AdminLobbyManager({
  participants,
  onAllowStudent,
  onDisallowStudent,
  onKickoutStudent,
  onAllowAllWaiting
}: AdminLobbyManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'waiting' | 'admitted'>('all');

  const waitingList = participants.filter(p => p.status === 'waiting');
  const admittedList = participants.filter(p => p.status === 'admitted');

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.grade && p.grade.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filter === 'waiting') return matchesSearch && p.status === 'waiting';
    if (filter === 'admitted') return matchesSearch && p.status === 'admitted';
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header with Stats & Allow All Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-orange-50/70 dark:bg-stone-800/60 border border-orange-200/60 dark:border-stone-700 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              Student Admission & Security Queue
              {waitingList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-900 animate-pulse">
                  {waitingList.length} Pending
                </span>
              )}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Total: {participants.length} | Admitted: {admittedList.length} | Waiting: {waitingList.length}
            </p>
          </div>
        </div>

        {/* Batch Allow All Button */}
        {waitingList.length > 0 && (
          <button
            onClick={onAllowAllWaiting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Allow All Waiting ({waitingList.length})</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {(['all', 'waiting', 'admitted'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              {tab === 'all' ? `All (${participants.length})` : tab === 'waiting' ? `Waiting (${waitingList.length})` : `Admitted (${admittedList.length})`}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-slate-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Participants List */}
      {filteredParticipants.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl space-y-2">
          <Users className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {participants.length === 0 
              ? 'No students have joined this session room yet. Share the class link to invite students!' 
              : 'No students matching the current filter.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-orange-100 dark:divide-stone-800 border border-orange-100 dark:border-stone-800 rounded-2xl overflow-hidden bg-white/50 dark:bg-stone-900/50 max-h-72 overflow-y-auto">
          {filteredParticipants.map(participant => (
            <div 
              key={participant.id} 
              className={`p-3 flex items-center justify-between gap-3 text-xs transition-colors ${
                participant.status === 'waiting' ? 'bg-amber-500/10' : ''
              }`}
            >
              {/* Student Identity */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-stone-800 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {participant.avatar || '👨‍🎓'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 dark:text-white truncate">
                      {participant.name}
                    </span>
                    {participant.status === 'admitted' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                        Admitted
                      </span>
                    )}
                    {participant.status === 'waiting' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 animate-pulse">
                        Waiting Approval
                      </span>
                    )}
                    {participant.status === 'rejected' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
                        Disallowed
                      </span>
                    )}
                    {participant.status === 'kicked' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                        Kicked
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 flex items-center gap-2">
                    <span>{participant.grade || 'Student'}</span>
                    <span>•</span>
                    <span>Joined: {new Date(participant.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {participant.status === 'waiting' && (
                  <>
                    <button
                      onClick={() => onAllowStudent(participant.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/25 transition-all cursor-pointer"
                      title="Allow student to enter live class"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Allow</span>
                    </button>
                    <button
                      onClick={() => onDisallowStudent(participant.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/25 transition-all cursor-pointer"
                      title="Disallow student admission"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Disallow</span>
                    </button>
                  </>
                )}

                {participant.status === 'admitted' && (
                  <button
                    onClick={() => onKickoutStudent(participant.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold bg-stone-200 dark:bg-stone-800 hover:bg-red-600 hover:text-white text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
                    title="Kick out from live session"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>Kickout</span>
                  </button>
                )}

                {(participant.status === 'rejected' || participant.status === 'kicked') && (
                  <button
                    onClick={() => onAllowStudent(participant.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Re-admit</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
