

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container mx-auto">
        <p className="text-sm">
          &copy; {currentYear} MongoMart. All rights reserved.
        </p>
        <p className="text-xs mt-1">
          Powered by FastAPI & MongoDB
          
        </p>
      </div>
    </footer>
  );
};

export default Footer;