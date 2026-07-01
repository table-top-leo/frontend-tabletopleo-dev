import OnboardingPage from './adminaccountsetup/setupwrapper'
import TableTopLeoLoginPage from './logintabletopleo/loginpage'
import MenuCategory from './menucategorypage/menucategorypage'
import MainAdminDashboard from './tabletopleodashboard/tabletopleodashboardpage'
import AdminDashboardNew from './tabletopleodashboard/adminpagedummy'
import CustomerWrapper from './cusotomerwrapper/CustomerWrapper'
function Home() {
  return (
    <>
    {/* <OnboardingPage/> */}
    <TableTopLeoLoginPage/>
    {/* <MainAdminDashboard/> */}
    {/* <AdminDashboardNew/> */}
    {/* <CustomerWrapper/> */}
    </>
  );
}

export default Home;