import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, DollarSign, MessageCircle, Wallet, ArrowRight, Recycle, ThumbsUp, Users, Zap, LogIn } from 'lucide-react';
import Image from 'next/image';
import SmartCycleLogo from '@/components/icons/SmartCycleLogo';

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <header className="container mx-auto px-4 sm:px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SmartCycleLogo className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold text-primary">SmartCycle</h1>
        </div>
        <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
          <Link href="/login">Login <LogIn className="ml-2 h-4 w-4" /></Link>
        </Button>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 py-12 md:py-20">
        <section className="text-center">
        <div className="inline-block bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm">
            <Zap className="inline-block h-4 w-4 mr-1.5 -mt-0.5" /> Revolutionizing Recycling, One Cycle at a Time!
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            Turn Your <span className="text-primary">Trash</span> into <span className="text-accent">Treasure</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            SmartCycle makes recycling fun, easy, and rewarding! Locate our smart vending machines, check material prices, and manage your earnings all in one vibrant app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              <Link href="/login">
                <LogIn className="mr-2 h-5 w-5" /> Access Your Account
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-accent border-accent hover:bg-accent/10 hover:text-accent shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300">
               <Link href="/#features">
                Learn More <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        <section id="features" className="mt-20 md:mt-32">
          <h3 className="text-3xl font-semibold text-center text-foreground mb-12">Why You&apos;ll Love SmartCycle</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <FeatureCard
              icon={<MapPin className="h-10 w-10 text-primary" />}
              title="Easy Machine Locator"
              description="Instantly find smart recycling machines near you with our playful interactive map."
            />
            <FeatureCard
              icon={<DollarSign className="h-10 w-10 text-accent" />}
              title="Great Material Prices"
              description="Get real-time prices for your recyclables. More cash for your trash!"
            />
            <FeatureCard
              icon={<MessageCircle className="h-10 w-10 text-primary" />}
              title="Friendly Chatbot"
              description="Our multilingual bot is ready to chat and help with all your recycling questions."
            />
            <FeatureCard
              icon={<Wallet className="h-10 w-10 text-accent" />}
              title="Cool Digital Wallet"
              description="Track earnings, snag awesome rewards, and redeem vouchers effortlessly."
            />
          </div>
        </section>
        
        <section className="mt-20 md:mt-32 text-center bg-card p-8 md:p-12 rounded-xl shadow-xl">
           <h3 className="text-3xl font-semibold text-foreground mb-6">Join the SmartCycle Movement!</h3>
           <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
             Be part of a vibrant community making a real difference. Recycling with SmartCycle isn't just smart, it's an adventure!
           </p>
            <Image 
                src="https://picsum.photos/id/1018/1200/400?random=1"
                alt="Happy community members engaged in recycling activities near SmartCycle machines" 
                width={1200} 
                height={400} 
                className="rounded-lg shadow-lg mx-auto mb-6"
                data-ai-hint="recycling community people"
            />
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-lg">
              <Link href="/login">
                Get Started Today! <ThumbsUp className="ml-2 h-5 w-5" />
              </Link>
            </Button>
        </section>

      </main>

      <footer className="text-center py-10 border-t mt-12">
        <div className="flex justify-center items-center gap-2 mb-2">
          <SmartCycleLogo className="h-7 w-7 text-primary" />
          <span className="font-semibold text-foreground">SmartCycle</span>
        </div>
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} SmartCycle. Making the world greener, one fun cycle at a time.</p>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-card hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col text-center items-center">
      <CardHeader className="items-center pt-6 pb-4">
        <div className="p-4 bg-primary/10 rounded-full mb-4">
         {icon}
        </div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pt-0">
        <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

