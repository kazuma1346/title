import { User, AlertCircle } from 'lucide-react';
import { MOCK_MEMBERS } from '../data/mockData';

export default function MemberScreen() {
  // グルーピング: 学年 -> 学部 -> メンバー
  const groupedMembers = MOCK_MEMBERS.reduce((acc, member) => {
    if (!acc[member.grade]) acc[member.grade] = {};
    if (!acc[member.grade][member.faculty]) acc[member.grade][member.faculty] = [];
    acc[member.grade][member.faculty].push(member);
    return acc;
  }, {});

  // 学年順（降順）、学部順でソートして表示
  const grades = Object.keys(groupedMembers).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4 text-center">
        <h2 className="text-sm font-bold text-gray-500 mb-1">現在の登録人数</h2>
        <p className="text-2xl font-bold text-[#20387B]">{MOCK_MEMBERS.length} 名</p>
      </div>

      <div className="space-y-6">
        {grades.map(grade => (
          <div key={grade}>
            <h3 className="font-bold text-lg text-gray-800 border-b-2 border-[#20387B] pb-1 mb-3 inline-block">
              {grade}
            </h3>
            <div className="space-y-4">
              {Object.keys(groupedMembers[grade]).sort().map(faculty => (
                <div key={`${grade}-${faculty}`} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-[#20387B]/10 px-3 py-2 text-sm font-bold text-[#20387B]">
                    {faculty}
                  </div>
                  <div className="divide-y divide-gray-100">
                    {groupedMembers[grade][faculty].map(member => {
                      // 直近5回の活動に一度も参加していないかチェック
                      const isInactive = !member.recentActivity.some(attended => attended);

                      return (
                        <div key={member.id} className="p-3 flex items-center justify-between min-h-[56px]">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isInactive ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                              <User size={16} />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isInactive ? 'text-gray-500' : 'text-gray-800'}`}>
                                {member.name}
                              </span>
                              {/* 警告表示 */}
                              {isInactive && (
                                <div className="flex items-center text-red-500 animate-pulse" title="直近5回の活動不参加">
                                  <AlertCircle size={14} />
                                  <span className="text-[10px] ml-0.5 font-bold">非アクティブ</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {member.role && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 font-bold rounded">
                              {member.role}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
