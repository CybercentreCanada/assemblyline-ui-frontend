import { DemoContainer } from 'components/routes/development/library/components/DemoContainer';
import { DemoSection } from 'components/routes/development/library/components/DemoSection';
import { useForm } from 'components/routes/development/library/contexts/form';
import { ActionableChip } from 'components/visual/Actionables/ActionableChip';
import { ActionableText } from 'components/visual/Actionables/ActionableText';
import { PageSection } from 'components/visual/Layouts/PageSection';
import React from 'react';

export type ActionableLibraryState = {
  actionable: {
    name: string;
    values: {
      classification: string;
      sectionOpen: boolean;
    };
  };
};
export const ACTIONABLE_LIBRARY_STATE: ActionableLibraryState = {
  actionable: {
    name: 'Actionable',
    values: {
      classification: 'TLP:C',
      sectionOpen: true
    }
  }
} as const;

export const ActionableSection = React.memo(() => {
  const form = useForm();

  return (
    <DemoContainer>
      <PageSection primary="Actionable Text" anchor subheader divider />

      <DemoSection
        id="Actionable Text - Hash"
        primary="Actionable Text - Hash"
        secondary=""
        right=""
        left={
          <>
            <ActionableText
              classification="TLP:C"
              category="hash"
              type="md5"
              value="d41d8cd98f00b204e9800998ecf8427e"
            />

            <ActionableText
              classification="TLP:C"
              category="hash"
              type="sha1"
              value="da39a3ee5e6b4b0d3255bfef95601890afd80709"
            />

            <ActionableText
              classification="TLP:C"
              category="hash"
              type="sha256"
              value="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            />

            <ActionableText
              classification="TLP:C"
              category="hash"
              type="ssdeep"
              value="3:V6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLh:V6hS1nLOkLh"
            />

            <ActionableText
              classification="TLP:C"
              category="hash"
              type="tlsh"
              value="T1FCD23A1234A1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12"
            />

            <ActionableText classification="TLP:C" category="hash" type="url" value="https://www.google.ca" />
          </>
        }
      />

      <DemoSection
        id="Actionable Text - Heuristic"
        primary="Actionable Text - Heuristic"
        secondary=""
        right=""
        left={
          <>
            <ActionableText
              classification="TLP:C"
              category="heuristic"
              type="md5"
              value="d41d8cd98f00b204e9800998ecf8427e"
            />

            <ActionableText
              classification="TLP:C"
              category="heuristic"
              type="sha1"
              value="da39a3ee5e6b4b0d3255bfef95601890afd80709"
            />

            <ActionableText
              classification="TLP:C"
              category="heuristic"
              type="sha256"
              value="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            />

            <ActionableText
              classification="TLP:C"
              category="heuristic"
              type="ssdeep"
              value="3:V6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLh:V6hS1nLOkLh"
            />

            <ActionableText
              classification="TLP:C"
              category="heuristic"
              type="tlsh"
              value="T1FCD23A1234A1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12"
            />

            <ActionableText classification="TLP:C" category="heuristic" type="url" value="https://www.google.ca" />
          </>
        }
      />

      <DemoSection
        id="Actionable Text - Metadata"
        primary="Actionable Text - Metadata"
        secondary=""
        right=""
        left={
          <>
            <ActionableText
              classification="TLP:C"
              category="metadata"
              type="md5"
              value="d41d8cd98f00b204e9800998ecf8427e"
            />

            <ActionableText
              classification="TLP:C"
              category="metadata"
              type="sha1"
              value="da39a3ee5e6b4b0d3255bfef95601890afd80709"
            />

            <ActionableText
              classification="TLP:C"
              category="metadata"
              type="sha256"
              value="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            />

            <ActionableText
              classification="TLP:C"
              category="metadata"
              type="ssdeep"
              value="3:V6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLh:V6hS1nLOkLh"
            />

            <ActionableText
              classification="TLP:C"
              category="metadata"
              type="tlsh"
              value="T1FCD23A1234A1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12"
            />

            <ActionableText classification="TLP:C" category="metadata" type="url" value="https://www.google.ca" />
          </>
        }
      />

      <DemoSection
        id="Actionable Text - Signature"
        primary="Actionable Text - Signature"
        secondary=""
        right=""
        left={
          <>
            <ActionableText
              classification="TLP:C"
              category="signature"
              type="md5"
              value="d41d8cd98f00b204e9800998ecf8427e"
            />

            <ActionableText
              classification="TLP:C"
              category="signature"
              type="sha1"
              value="da39a3ee5e6b4b0d3255bfef95601890afd80709"
            />

            <ActionableText
              classification="TLP:C"
              category="signature"
              type="sha256"
              value="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            />

            <ActionableText
              classification="TLP:C"
              category="signature"
              type="ssdeep"
              value="3:V6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLh:V6hS1nLOkLh"
            />

            <ActionableText
              classification="TLP:C"
              category="signature"
              type="tlsh"
              value="T1FCD23A1234A1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12"
            />

            <ActionableText classification="TLP:C" category="signature" type="url" value="https://www.google.ca" />
          </>
        }
      />

      <DemoSection
        id="Actionable Text - Tag"
        primary="Actionable Text - Tag"
        secondary=""
        right=""
        left={
          <>
            <ActionableText classification="TLP:C" category="tag" type="md5" value="d41d8cd98f00b204e9800998ecf8427e" />

            <ActionableText
              classification="TLP:C"
              category="tag"
              type="sha1"
              value="da39a3ee5e6b4b0d3255bfef95601890afd80709"
            />

            <ActionableText
              classification="TLP:C"
              category="tag"
              type="sha256"
              value="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            />

            <ActionableText
              classification="TLP:C"
              category="tag"
              type="ssdeep"
              value="3:V6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLh:V6hS1nLOkLh"
            />

            <ActionableText
              classification="TLP:C"
              category="tag"
              type="tlsh"
              value="T1FCD23A1234A1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12"
            />

            <ActionableText classification="TLP:C" category="tag" type="url" value="https://www.google.ca" />
          </>
        }
      />

      <PageSection primary="Actionable Custom Chip" anchor subheader divider />

      <DemoSection
        id="Actionable Custom Chip - Hash"
        primary="Actionable Custom Chip - Hash"
        secondary=""
        right=""
        left={
          <>
            <ActionableText
              classification="TLP:C"
              category="hash"
              type="md5"
              value="d41d8cd98f00b204e9800998ecf8427e"
            />

            <ActionableText
              classification="TLP:C"
              category="hash"
              type="sha1"
              value="da39a3ee5e6b4b0d3255bfef95601890afd80709"
            />

            <ActionableText
              classification="TLP:C"
              category="hash"
              type="sha256"
              value="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            />

            <ActionableText
              classification="TLP:C"
              category="hash"
              type="ssdeep"
              value="3:V6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLh:V6hS1nLOkLh"
            />

            <ActionableText
              classification="TLP:C"
              category="hash"
              type="tlsh"
              value="T1FCD23A1234A1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12"
            />

            <ActionableText classification="TLP:C" category="hash" type="url" value="https://www.google.ca" />
          </>
        }
      />

      <DemoSection
        id="Actionable Custom Chip - Heuristic"
        primary="Actionable Custom Chip - Heuristic"
        secondary=""
        right=""
        left={
          <>
            <ActionableChip
              classification="TLP:C"
              category="heuristic"
              type="md5"
              label="d41d8cd98f00b204e9800998ecf8427e"
            />

            <ActionableChip
              classification="TLP:C"
              category="heuristic"
              type="sha1"
              label="da39a3ee5e6b4b0d3255bfef95601890afd80709"
            />

            <ActionableChip
              classification="TLP:C"
              category="heuristic"
              type="sha256"
              label="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            />

            <ActionableChip
              classification="TLP:C"
              category="heuristic"
              type="ssdeep"
              label="3:V6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLh:V6hS1nLOkLh"
            />

            <ActionableChip
              classification="TLP:C"
              category="heuristic"
              type="tlsh"
              label="T1FCD23A1234A1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12"
            />

            <ActionableChip classification="TLP:C" category="heuristic" type="url" label="https://www.google.ca" />
          </>
        }
      />

      <DemoSection
        id="Actionable Custom Chip - Metadata"
        primary="Actionable Custom Chip - Metadata"
        secondary=""
        right=""
        left={
          <>
            <ActionableChip
              classification="TLP:C"
              category="metadata"
              type="md5"
              label="d41d8cd98f00b204e9800998ecf8427e"
            />

            <ActionableChip
              classification="TLP:C"
              category="metadata"
              type="sha1"
              label="da39a3ee5e6b4b0d3255bfef95601890afd80709"
            />

            <ActionableChip
              classification="TLP:C"
              category="metadata"
              type="sha256"
              label="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            />

            <ActionableChip
              classification="TLP:C"
              category="metadata"
              type="ssdeep"
              label="3:V6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLh:V6hS1nLOkLh"
            />

            <ActionableChip
              classification="TLP:C"
              category="metadata"
              type="tlsh"
              label="T1FCD23A1234A1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12"
            />

            <ActionableChip classification="TLP:C" category="metadata" type="url" label="https://www.google.ca" />
          </>
        }
      />

      <DemoSection
        id="Actionable Custom Chip - Signature"
        primary="Actionable Custom Chip - Signature"
        secondary=""
        right=""
        left={
          <>
            <ActionableChip
              classification="TLP:C"
              category="signature"
              type="md5"
              label="d41d8cd98f00b204e9800998ecf8427e"
            />

            <ActionableChip
              classification="TLP:C"
              category="signature"
              type="sha1"
              label="da39a3ee5e6b4b0d3255bfef95601890afd80709"
            />

            <ActionableChip
              classification="TLP:C"
              category="signature"
              type="sha256"
              label="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            />

            <ActionableChip
              classification="TLP:C"
              category="signature"
              type="ssdeep"
              label="3:V6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLh:V6hS1nLOkLh"
            />

            <ActionableChip
              classification="TLP:C"
              category="signature"
              type="tlsh"
              label="T1FCD23A1234A1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12"
            />

            <ActionableChip classification="TLP:C" category="signature" type="url" label="https://www.google.ca" />
          </>
        }
      />

      <DemoSection
        id="Actionable Custom Chip - Tag"
        primary="Actionable Custom Chip - Tag"
        secondary=""
        right=""
        left={
          <>
            <ActionableChip classification="TLP:C" category="tag" type="md5" label="d41d8cd98f00b204e9800998ecf8427e" />

            <ActionableChip
              classification="TLP:C"
              category="tag"
              type="sha1"
              label="da39a3ee5e6b4b0d3255bfef95601890afd80709"
            />

            <ActionableChip
              classification="TLP:C"
              category="tag"
              type="sha256"
              label="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            />

            <ActionableChip
              classification="TLP:C"
              category="tag"
              type="ssdeep"
              label="3:V6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLhV6hS1nLOkLh:V6hS1nLOkLh"
            />

            <ActionableChip
              classification="TLP:C"
              category="tag"
              type="tlsh"
              label="T1FCD23A1234A1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12"
            />

            <ActionableChip classification="TLP:C" category="tag" type="url" label="https://www.google.ca" />
          </>
        }
      />
    </DemoContainer>
  );
});
