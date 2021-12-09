import { PCAPFormModule } from './pcap-form.module';

describe('PCAPFormModule', () => {
  let pcap_form_module: PCAPFormModule;

  beforeEach(() => {
    pcap_form_module = new PCAPFormModule();
  });

  it('should create an instance of PCAPFormModule', () => {
    expect(pcap_form_module).toBeTruthy();
  });
});
