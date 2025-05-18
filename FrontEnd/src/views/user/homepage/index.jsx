import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import mapImg from '../../../assets/img/map.png'; // điều chỉnh đường dẫn cho đúng
const events = [
  { date: '25/05/2025', title: 'Họp cư dân định kỳ', description: 'Thảo luận về quy định chung và kế hoạch bảo trì.' },
  { date: '01/06/2025', title: 'Ngày hội gia đình', description: 'Sự kiện ngoài trời với trò chơi và tiệc BBQ.' },
  { date: '15/06/2025', title: 'Dọn dẹp cộng đồng', description: 'Hoạt động làm sạch khu vực chung cư.' },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      {/* Map Section */}
      <div className="w-full px-4 mb-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img
            src={mapImg}
            alt="Map of BlueMoon Apartment"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Calendar Section */}
      <div className="w-full max-w-4xl px-4 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Lịch BlueMoon</h2>
          <div className="flex justify-center">
            <Calendar
              className="shadow-md rounded-lg"
              tileClassName="text-center"
            />
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="w-full max-w-4xl px-4 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Sự kiện sắp tới</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-4">Ngày</th>
                  <th className="p-4">Sự kiện</th>
                  <th className="p-4">Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr key={index} className="border-b hover:bg-gray-100">
                    <td className="p-4">{event.date}</td>
                    <td className="p-4">{event.title}</td>
                    <td className="p-4">{event.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <div className="w-full max-w-4xl px-4 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Giới thiệu về BlueMoon</h2>
          <p className="text-gray-600 leading-relaxed">
            Chung cư <strong>BlueMoon</strong> là một khu dân cư hiện đại tọa lạc tại trung tâm thành phố, được thiết kế để mang lại cuộc sống tiện nghi và đẳng cấp cho cư dân. Được thành lập vào năm 2015, BlueMoon đã trở thành biểu tượng của sự sang trọng và thân thiện với môi trường.
            <br /><br />
            <strong>Tính năng nổi bật:</strong>
            <ul className="list-disc pl-6">
              <li>Hệ thống an ninh 24/7 với camera giám sát và đội ngũ bảo vệ chuyên nghiệp.</li>
              <li>Khu vui chơi trẻ em, phòng gym, hồ bơi và công viên xanh ngay trong khuôn viên.</li>
              <li>Hệ thống quản lý tòa nhà thông minh, hỗ trợ cư dân qua ứng dụng di động.</li>
              <li>Gần các tiện ích công cộng như trường học, bệnh viện và trung tâm thương mại.</li>
            </ul>
            <br />
            <strong>Lịch sử:</strong> BlueMoon được phát triển bởi tập đoàn bất động sản hàng đầu, với mục tiêu tạo ra một cộng đồng bền vững và gắn kết. Qua nhiều năm, chúng tôi đã tổ chức hàng loạt sự kiện cộng đồng để tăng cường sự kết nối giữa các cư dân.
            <br /><br />
            <strong>Địa chỉ:</strong> Số 123, Đường Nguyệt Quang, Quận 1, Thành phố Hồ Chí Minh, Việt Nam.
            <br /><br />
            Hãy đến với BlueMoon để trải nghiệm một cuộc sống hiện đại, tiện nghi và ấm cúng!
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;