import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="small-section bg-gray-lighter footer pb-60">
      <div className="container">
        <div className="local-scroll mb-30">
          <Link href="#top">
            <Image src="/images/logoRed2.png" width={156} height={72} alt="Red PINOS logo" />
            <span className="sr-only">Scroll to the top of the page</span>
          </Link>
        </div>
        <div className="footer-social-links mb-110 mb-xs-60">
          <a
            href="https://www.facebook.com/profile.php?id=100086464250372"
            title="Facebook"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa fa-facebook" />
            <span className="sr-only">Facebook profile</span>
          </a>
          <a
            href="https://www.instagram.com/red.pinos/"
            title="Instagram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa fa-instagram" />
            <span className="sr-only">Instagram profile</span>
          </a>
        </div>
        <div className="footer-text">
          <div className="footer-copy font-alt">
            Red PINOS. Todos los derechos reservados.
          </div>
          <div className="mt-30 footer-made">
            Sitio web creado por{' '}
            <a
              href="https://linkedin.com/in/felipebianchini"
              target="_blank"
              rel="noopener noreferrer"
            >
              Felipe Bianchini
            </a>
            .
          </div>
        </div>
      </div>
      <div className="local-scroll">
        <a href="#top" className="link-to-top">
          <i className="fa fa-caret-up" />
          <span className="sr-only">Scroll to top</span>
        </a>
      </div>
    </footer>
  );
}
