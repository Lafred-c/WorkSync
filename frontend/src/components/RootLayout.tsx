import {Outlet, useLocation} from "react-router-dom";
import {motion, AnimatePresence} from "framer-motion";
import Sidebar from "./layout/Sidebar";
import Navbar from "./layout/Navbar";

const RootLayout = () => {
  const location = useLocation();

  return (
    <div className="flex">
      <Sidebar title={"WorkSync"} />
      <main className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{opacity: 0, y: 2}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0}}
              transition={{duration: 0.14, ease: "easeOut"}}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default RootLayout;
